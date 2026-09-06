/**
 * Shared test helpers — drive the real Hono app in-process via app.request()
 * against the test database. Every entity gets a unique suffix so suites
 * never collide with each other or with the demo seed data.
 */
import { randomUUID } from "node:crypto";
import { app } from "../src/app";

export interface TestUser {
  token: string;
  user: { id: string; email: string; name: string };
  email: string;
  password: string;
}

export const unique = () => randomUUID().slice(0, 8);
export const PASSWORD = "sup3rsecret!";

export async function api(
  path: string,
  init: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (init.token) headers.authorization = `Bearer ${init.token}`;
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body !== undefined && !isForm) headers["content-type"] = "application/json";
  const body: FormData | string | undefined =
    init.body === undefined
      ? undefined
      : isForm
        ? (init.body as FormData)
        : JSON.stringify(init.body);
  return app.request(path, { method: init.method ?? "GET", headers, body });
}

/** Register a fresh user through the real endpoint (password → credential account). */
export async function registerUser(name?: string): Promise<TestUser> {
  const suffix = unique();
  const email = `test-${suffix}@example.com`;
  const res = await api("/auth/register", {
    method: "POST",
    body: { name: name ?? `Test ${suffix}`, email, password: PASSWORD },
  });
  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: { user: TestUser["user"]; token: string } };
  return { token: data.token, user: data.user, email, password: PASSWORD };
}

/** Create an org through the real endpoint; the creator becomes its Owner. */
export async function createOrganization(token: string, name?: string) {
  const suffix = unique();
  const res = await api("/organizations", {
    method: "POST",
    token,
    body: { name: name ?? `Org ${suffix}`, slug: `org-${suffix}` },
  });
  if (res.status !== 201) {
    throw new Error(`createOrganization failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: { id: string; slug: string; type: string } };
  return data;
}

export interface TestOrg {
  token: string;
  orgId: string;
  slug: string;
}

/** A registered user + an org they own — the common baseline for tenant tests. */
export async function setupOrg(name?: string): Promise<TestOrg> {
  const owner = await registerUser(name);
  const org = await createOrganization(owner.token, name);
  return { token: owner.token, orgId: org.id, slug: org.slug };
}

export interface TestProject {
  token: string;
  orgId: string;
  projectId: string;
}

/** Owner + org + one project — the baseline for every project-scoped suite. */
export async function setupProject(): Promise<TestProject> {
  const org = await setupOrg();
  const project = await createProject(org.token, org.orgId);
  return { token: org.token, orgId: org.orgId, projectId: project.id };
}

/** Create a project through the real endpoint; returns the parsed row. */
export async function createProject(
  token: string,
  orgId: string,
  overrides: Partial<{ name: string; slug: string; key: string }> = {},
) {
  const suffix = unique().toUpperCase();
  const res = await api(`/organizations/${orgId}/projects`, {
    method: "POST",
    token,
    body: {
      name: `Project ${suffix}`,
      slug: `project-${suffix.toLowerCase()}`,
      key: `P${suffix.slice(0, 5)}`,
      ...overrides,
    },
  });
  if (res.status !== 201) {
    throw new Error(`createProject failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: { id: string; slug: string; key: string } };
  return data;
}

/** Full membership flow: invite an email into the org and accept it. */
export async function inviteAndAcceptOrgMember(
  org: TestOrg,
  email: string,
  roleName = "Member",
) {
  const create = await api(`/organizations/${org.orgId}/invitations`, {
    method: "POST",
    token: org.token,
    body: { email, roleName },
  });
  const { data } = (await create.json()) as { data: { id: string } };
  const accept = await api(`/organizations/${org.orgId}/invitations/${data.id}`, {
    method: "PATCH",
    token: org.token,
    body: { action: "accept" },
  });
  return accept;
}

/** Register a user and make them a workspace Member of the org. */
export async function addOrgMember(org: TestOrg, roleName = "Member") {
  const member = await registerUser();
  const accept = await inviteAndAcceptOrgMember(org, member.email, roleName);
  if (accept.status !== 200) {
    throw new Error(`addOrgMember failed: ${accept.status} ${await accept.text()}`);
  }
  return member;
}
