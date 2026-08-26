/** Workspace seed — system roles + the demo organizations/memberships into
 *  Postgres when empty. Returns them for the in-memory seed (projects and
 *  below reference the real DB ids). Conflict-safe for concurrent boots;
 *  non-demo databases are left alone. */
import type { User, Organization, Role } from "@pmin/core";
import { SYSTEM_WORKSPACE_ROLES, SYSTEM_PROJECT_ROLES } from "@pmin/core";
import * as orgRepo from "./org-repo";

export interface SeededWorkspace {
  orgs: Organization[];
  roles: Role[];
}

const DEMO_ORGS: {
  slug: string;
  name: string;
  type: "team" | "personal";
  description: string;
  website?: string;
  members: { email: string; roleName: string }[];
}[] = [
  {
    slug: "northwind",
    name: "Northwind",
    type: "team",
    description: "Software House",
    website: "https://northwind.io",
    members: [
      { email: "aisha@northwind.io", roleName: "Owner" },
      { email: "marco@northwind.io", roleName: "Admin" },
      { email: "lin@northwind.io", roleName: "Member" },
      { email: "diego@northwind.io", roleName: "Member" },
      { email: "sara@northwind.io", roleName: "Member" },
      { email: "jonas@northwind.io", roleName: "Member" },
    ],
  },
  {
    slug: "personal",
    name: "Personal",
    type: "personal",
    description: "Aisha's personal workspace",
    members: [{ email: "aisha@northwind.io", roleName: "Owner" }],
  },
  {
    slug: "amin-studio",
    name: "Amin Studio",
    type: "team",
    description: "Independent consultancy",
    members: [{ email: "aisha@northwind.io", roleName: "Owner" }],
  },
  {
    slug: "acme-internal",
    name: "Acme Internal",
    type: "team",
    description: "Acme's internal product org",
    members: [{ email: "aisha@northwind.io", roleName: "Member" }],
  },
];

export async function seedWorkspace(users: User[]): Promise<SeededWorkspace> {
  // system roles (idempotent — conflict-nothing inserts)
  const roleDefs = [...SYSTEM_WORKSPACE_ROLES, ...SYSTEM_PROJECT_ROLES];
  for (const r of roleDefs) {
    await orgRepo.insertRoleIfAbsent({
      organizationId: null,
      scope: r.scope,
      name: r.name,
      isSystem: true,
      permissions: r.permissions,
    });
  }
  const roles = await orgRepo.listRoles();

  // demo orgs + memberships (only into an empty org table)
  const anyOrg = await orgRepo.listOrganizations();
  if (anyOrg.length > 0) return { orgs: anyOrg, roles };

  const userByEmail = new Map(users.map((u) => [u.email, u]));
  for (const o of DEMO_ORGS) {
    if (await orgRepo.slugTaken(o.slug)) continue; // belt-and-suspenders vs the boot lock
    const org = await orgRepo.insertOrganization({
      name: o.name,
      slug: o.slug,
      type: o.type,
      description: o.description,
      website: o.website ?? null,
    });
    for (const m of o.members) {
      const user = userByEmail.get(m.email);
      if (!user) continue;
      const role = roles.find((r) => r.scope === "workspace" && r.name === m.roleName);
      if (!role) continue;
      await orgRepo.insertMember({ organizationId: org.id, userId: user.id, roleId: role.id });
    }
  }
  return { orgs: await orgRepo.listOrganizations(), roles };
}
