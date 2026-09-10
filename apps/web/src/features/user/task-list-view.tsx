"use client";

/** My tasks (/tasks) — tasks assigned to the signed-in user across every
 *  project/workspace. Aggregated client-side from the per-project task
 *  lists (assignee-filtered, keyed under the qk.tasks(pid) family so board
 *  invalidation still busts them); a cross-project endpoint can replace
 *  this later without touching the page. */
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import type { Task } from "@pmin/core";
import { useApp } from "@/providers/app-provider";
import { workspaceService } from "@/services/workspace";
import { tasksService } from "@/services/tasks";
import { qk } from "@/lib/query-keys";
import { dateShort, isOverdue } from "@/lib/format";
import { hueFor, projColor } from "@/components/nav-data";
import { Prio, StatusPill } from "@/components/ui/badges";

export function TaskListView() {
  const { user, orgs } = useApp();
  const router = useRouter();

  // (org, project) pairs — one projects query per org (cache-shared)
  const orgQueries = useQueries({
    queries: (orgs ?? []).map((o) => ({
      queryKey: qk.projects(o.id),
      queryFn: () => workspaceService.projects(o.id),
    })),
  });
  const pairs = (orgs ?? []).flatMap((o, i) =>
    (orgQueries[i].data ?? []).map((p) => ({ org: o, project: p })),
  );

  const taskQueries = useQueries({
    queries: pairs.map(({ project }) => ({
      queryKey: [...qk.tasks(project.id), "mine"],
      queryFn: () => tasksService.list(project.id, { assigneeId: user!.id }),
      enabled: !!user,
    })),
  });
  const statusQueries = useQueries({
    queries: pairs.map(({ project }) => ({
      queryKey: qk.statuses(project.id),
      queryFn: () => tasksService.statuses(project.id),
    })),
  });

  const loading =
    !user ||
    !orgs ||
    orgQueries.some((q) => q.isLoading) ||
    taskQueries.some((q) => q.isLoading);

  const groups = pairs
    .map(({ org, project }, i) => ({
      org,
      project,
      statuses: statusQueries[i].data,
      tasks: (taskQueries[i].data?.items ?? [])
        .filter((t) => !t.parentId)
        .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999")),
    }))
    .filter((g) => g.tasks.length > 0);

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">My tasks</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Assigned to you across {(orgs ?? []).length} {(orgs ?? []).length === 1 ? "workspace" : "workspaces"}.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="muted">Loading…</div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ padding: 18 }}>
          <div className="muted">No tasks assigned to you yet.</div>
        </div>
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {groups.map(({ org, project, statuses, tasks }) => (
            <div className="card" key={project.id}>
              <div className="panel-head">
                <span className="pico" style={{ background: projColor(hueFor(project.id)) }}>
                  {project.icon ?? project.name[0]}
                </span>
                <h3>{project.name}</h3>
                <span className="muted mono">
                  /{org.slug}/{project.slug}
                </span>
                <div className="right">
                  <button
                    className="btn ghost sm"
                    onClick={() => router.push(`/${org.slug}/${project.slug}/tasks`)}
                  >
                    Open board
                  </button>
                </div>
              </div>
              <div className="panel-body flush">
                {tasks.map((t: Task) => (
                  <button
                    key={t.id}
                    className="mrow"
                    style={{ alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}
                    onClick={() => router.push(`/${org.slug}/${project.slug}/tasks/${t.order}`)}
                    title={`Open ${project.key}-${t.order}`}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.title}
                      </div>
                      {t.dueDate && (
                        <div
                          className="tiny"
                          style={{ color: isOverdue(t.dueDate) ? "var(--danger)" : undefined }}
                        >
                          Due {dateShort(t.dueDate)}
                        </div>
                      )}
                    </div>
                    <span className="tag m mono">
                      {project.key}-{t.order}
                    </span>
                    <StatusPill name={statuses?.find((s) => s.id === t.statusId)?.name ?? "—"} />
                    <Prio priority={t.priority} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
