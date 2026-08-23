/** Project seed — the 7 demo projects + Atlas memberships + visit history
 *  into Postgres when the projects table is empty. Returns them for the
 *  in-memory seed (tasks, statuses, docs, planning reference the DB ids).
 *  Existence-guarded; the boot advisory lock serializes concurrent boots. */
import type { User, Organization, Role } from "@pmin/core";
import { db } from "./pg";
import { projectVisits } from "@pmin/core/db";
import * as orgRepo from "./org-repo";
import * as projectRepo from "./project-repo";
import type { ProjectWithMeta } from "./project-repo";

const DEMO_PROJECTS: {
  key: string;
  name: string;
  slug: string;
  icon: string;
  orgSlug: string;
  members?: { email: string; roleName: string }[]; // atlas only
}[] = [
  {
    key: "ATL",
    name: "Atlas Platform 2.0",
    slug: "atlas-platform-2",
    icon: "A",
    orgSlug: "northwind",
    members: [
      { email: "aisha@northwind.io", roleName: "Project Admin" },
      { email: "marco@northwind.io", roleName: "Member" },
      { email: "lin@northwind.io", roleName: "Member" },
      { email: "diego@northwind.io", roleName: "Member" },
      { email: "sara@northwind.io", roleName: "Member" },
      { email: "jonas@northwind.io", roleName: "Member" },
    ],
  },
  { key: "MOB", name: "Mobile App v1", slug: "mobile-app-v1", icon: "M", orgSlug: "northwind" },
  { key: "NOT", name: "Notes", slug: "notes", icon: "N", orgSlug: "personal" },
  { key: "DWH", name: "Data Warehouse", slug: "data-warehouse", icon: "D", orgSlug: "amin-studio" },
  { key: "BRD", name: "Brand Refresh", slug: "brand-refresh", icon: "B", orgSlug: "amin-studio" },
  { key: "MKT", name: "Marketing Site", slug: "marketing-site", icon: "W", orgSlug: "acme-internal" },
  { key: "OPS", name: "Ops Automation", slug: "ops-automation", icon: "O", orgSlug: "acme-internal" },
];

const DAY = 86_400_000;

export async function seedProjects(
  users: User[],
  orgs: Organization[],
  _roles: Role[],
): Promise<ProjectWithMeta[]> {
  if ((await projectRepo.listAllProjects()).length > 0) return projectRepo.listAllProjects();

  const userByEmail = new Map(users.map((u) => [u.email, u]));
  const orgBySlug = new Map(orgs.map((o) => [o.slug, o]));

  for (const p of DEMO_PROJECTS) {
    const org = orgBySlug.get(p.orgSlug);
    if (!org || (await projectRepo.keyTakenInOrg(org.id, p.key))) continue;
    const project = await projectRepo.insertProject({
      organizationId: org.id,
      name: p.name,
      slug: p.slug,
      key: p.key,
      icon: p.icon,
      description: null,
    });
    for (const m of p.members ?? []) {
      const user = userByEmail.get(m.email);
      if (!user) continue;
      const role = await orgRepo.findRoleByName("project", m.roleName);
      if (!role) continue;
      await projectRepo.insertProjectMember({
        projectId: project.id,
        userId: user.id,
        roleId: role.id,
      });
    }
  }

  // Aisha's visit history (powers recents + landing project): mobile two days
  // ago, atlas yesterday.
  const all = await projectRepo.listAllProjects();
  const byKey = new Map(all.map((p) => [p.key, p]));
  const aisha = userByEmail.get("aisha@northwind.io");
  if (aisha) {
    const stamps: [string, number][] = [
      ["MOB", 2],
      ["ATL", 1],
    ];
    for (const [key, daysAgo] of stamps) {
      const p = byKey.get(key);
      if (!p) continue;
      const visitedAt = new Date(Date.now() - daysAgo * DAY);
      await db
        .insert(projectVisits)
        .values({ userId: aisha.id, projectId: p.id, visitedAt })
        .onConflictDoUpdate({
          target: [projectVisits.userId, projectVisits.projectId],
          set: { visitedAt },
        });
    }
  }

  return projectRepo.listAllProjects();
}
