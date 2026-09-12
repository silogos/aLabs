/** Workspace seed — system roles (every boot, production included) + the
 *  demo organizations/memberships into Postgres when empty. Conflict-safe
 *  for concurrent boots; non-demo databases are left alone. */
import type { User, Organization, Role } from "@pmin/core";
import { SYSTEM_WORKSPACE_ROLES, SYSTEM_PROJECT_ROLES } from "@pmin/core";
import * as orgRepo from "./org-repo";

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

/** System workspace/project roles — org creation, invitations and project
 *  membership resolve these by name at runtime, so they seed on every boot
 *  regardless of the demo gate. Idempotent (conflict-nothing inserts). */
export async function seedSystemRoles(): Promise<Role[]> {
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
  return orgRepo.listRoles();
}

/** Demo orgs + memberships (only into an empty org table). */
export async function seedWorkspace(users: User[], roles: Role[]): Promise<Organization[]> {
  const anyOrg = await orgRepo.listOrganizations();
  if (anyOrg.length > 0) return anyOrg;

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
  return orgRepo.listOrganizations();
}
