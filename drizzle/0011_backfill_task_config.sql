-- Backfill task config for projects created before the 5-status/5-type
-- defaults (issue #57): projects whose statuses still exactly match the old
-- 3-default set (To Do default + In Progress + Done) gain Backlog and In
-- Review; every project gains the Story and Subtask types. Customized
-- projects (any other status set) are left untouched.
--
-- gen_random_uuid() (v4) instead of the app's uuidv7(): acceptable for two
-- config rows per project — the v7 convention exists for time-ordered bulk
-- data, not uniqueness.

-- capture the target set first — the inserts below would change the predicate
CREATE TEMP TABLE _old_default_projects AS
SELECT project_id FROM task_statuses
GROUP BY project_id
HAVING count(*) = 3
   AND count(*) FILTER (WHERE name = 'To Do' AND is_default) = 1
   AND count(*) FILTER (WHERE name IN ('To Do', 'In Progress', 'Done')) = 3;

-- shift the old orders (To Do 0 / In Progress 1 / Done 2 → 1 / 2 / 4)
UPDATE task_statuses SET "order" = 1
WHERE name = 'To Do' AND project_id IN (SELECT project_id FROM _old_default_projects);
UPDATE task_statuses SET "order" = 2
WHERE name = 'In Progress' AND project_id IN (SELECT project_id FROM _old_default_projects);
UPDATE task_statuses SET "order" = 4
WHERE name = 'Done' AND project_id IN (SELECT project_id FROM _old_default_projects);

-- Backlog (order 0) and In Review (order 3) for those projects
INSERT INTO task_statuses (id, project_id, name, color, "order", is_default, created_at)
SELECT gen_random_uuid(), project_id, 'Backlog', 'var(--faint)', 0, false, now()
FROM _old_default_projects;

INSERT INTO task_statuses (id, project_id, name, color, "order", is_default, created_at)
SELECT gen_random_uuid(), project_id, 'In Review', 'var(--violet)', 3, false, now()
FROM _old_default_projects;

DROP TABLE _old_default_projects;

-- the five default types for every project missing any of them (additive —
-- custom types stay)
INSERT INTO task_types (id, project_id, name, created_at)
SELECT gen_random_uuid(), p.id, v.name, now()
FROM projects p
CROSS JOIN (VALUES ('Epic'), ('Story'), ('Task'), ('Bug'), ('Subtask')) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM task_types tt WHERE tt.project_id = p.id AND tt.name = v.name
);
