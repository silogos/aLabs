/** Invitation accept flow — the invitee-facing token endpoints under
 *  /invitations (admin create/list/cancel live in organizations.test.ts). */
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../src/db/pg";
import { invitations } from "@pmin/core/db";
import { api, registerUser, setupOrg, unique } from "./helpers";

/* ---------------- helpers ---------------- */

/** Create an invitation through the admin endpoint and extract its accept
 *  token from the returned inviteUrl (the raw token never leaves URLs). */
async function createInvitationWithToken(org: { token: string; orgId: string }, email: string) {
  const res = await api(`/organizations/${org.orgId}/invitations`, {
    method: "POST",
    token: org.token,
    body: { email, roleName: "Member" },
  });
  expect(res.status).toBe(201);
  const { data } = (await res.json()) as { data: { id: string; inviteUrl: string } };
  const token = new URL(data.inviteUrl).searchParams.get("token");
  expect(token).toBeTruthy();
  return { invitationId: data.id, token: token! };
}

/** Push an invitation past its expiry directly in the DB — no endpoint can. */
async function backdate(invitationId: string) {
  await db
    .update(invitations)
    .set({ expiresAt: new Date(Date.now() - 1000) })
    .where(eq(invitations.id, invitationId));
}

/* ---------------- preview (public) ---------------- */

describe("GET /invitations/:token", () => {
  it("previews a pending invitation without a session", async () => {
    const org = await setupOrg();
    const email = `preview-${unique()}@example.com`;
    const { token } = await createInvitationWithToken(org, email);

    const res = await api(`/invitations/${token}`);
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { organizationName: string; email: string; roleName: string; status: string };
    };
    expect(data.email).toBe(email);
    expect(data.roleName).toBe("Member");
    expect(data.status).toBe("pending");
    expect(data.organizationName).toMatch(/Org /);
  });

  it("404s on an unknown token", async () => {
    expect((await api("/invitations/no-such-token")).status).toBe(404);
  });

  it("flips a past-expiry invitation to expired on lookup", async () => {
    const org = await setupOrg();
    const email = `expired-${unique()}@example.com`;
    const { invitationId, token } = await createInvitationWithToken(org, email);
    await backdate(invitationId);

    const preview = await api(`/invitations/${token}`);
    expect(preview.status).toBe(200);
    const { data } = (await preview.json()) as { data: { status: string } };
    expect(data.status).toBe("expired");

    // the flip is persisted — the admin list sees it too, not "pending"
    const list = await api(`/organizations/${org.orgId}/invitations`, { token: org.token });
    const items = ((await list.json()) as { items: { id: string; status: string }[] }).items;
    expect(items.find((i) => i.id === invitationId)?.status).toBe("expired");
  });
});

/* ---------------- accept (invitee) ---------------- */

describe("POST /invitations/:token/accept", () => {
  it("lets the registered invitee accept themselves", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    const { token } = await createInvitationWithToken(org, invitee.email);

    const accept = await api(`/invitations/${token}/accept`, {
      method: "POST",
      token: invitee.token,
    });
    expect(accept.status).toBe(200);
    const { data } = (await accept.json()) as { data: { ok: boolean; organization: { id: string } } };
    expect(data.ok).toBe(true);
    expect(data.organization.id).toBe(org.orgId);

    // membership is real: the org appears in the invitee's own org list
    const orgs = await api("/organizations", { token: invitee.token });
    const list = ((await orgs.json()) as { data: { id: string }[] }).data;
    expect(list.some((o) => o.id === org.orgId)).toBe(true);
  });

  it("requires a session (401)", async () => {
    const org = await setupOrg();
    const { token } = await createInvitationWithToken(org, `anon-${unique()}@example.com`);
    expect((await api(`/invitations/${token}/accept`, { method: "POST" })).status).toBe(401);
  });

  it("rejects a signed-in user who is not the invitee (403)", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    const other = await registerUser();
    const { token } = await createInvitationWithToken(org, invitee.email);

    const res = await api(`/invitations/${token}/accept`, { method: "POST", token: other.token });
    expect(res.status).toBe(403);

    // the invitation survived — the right account can still accept
    const retry = await api(`/invitations/${token}/accept`, {
      method: "POST",
      token: invitee.token,
    });
    expect(retry.status).toBe(200);
  });

  it("rejects an expired invitation with 400", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    const { invitationId, token } = await createInvitationWithToken(org, invitee.email);
    await backdate(invitationId);

    const res = await api(`/invitations/${token}/accept`, { method: "POST", token: invitee.token });
    expect(res.status).toBe(400);
  });

  it("rejects a cancelled invitation with 400", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    const { invitationId, token } = await createInvitationWithToken(org, invitee.email);

    const cancel = await api(`/organizations/${org.orgId}/invitations/${invitationId}`, {
      method: "PATCH",
      token: org.token,
      body: { action: "cancel" },
    });
    expect(cancel.status).toBe(200);

    const res = await api(`/invitations/${token}/accept`, { method: "POST", token: invitee.token });
    expect(res.status).toBe(400);
  });

  it("is single-use — a second accept 400s", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    const { token } = await createInvitationWithToken(org, invitee.email);

    expect(
      (await api(`/invitations/${token}/accept`, { method: "POST", token: invitee.token }))
        .status,
    ).toBe(200);
    expect(
      (await api(`/invitations/${token}/accept`, { method: "POST", token: invitee.token }))
        .status,
    ).toBe(400);
  });
});

/* ---------------- expiry vs. the admin flow ---------------- */

describe("expiry and the admin-driven accept", () => {
  it("blocks the admin PATCH accept of an expired invitation", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    const { invitationId } = await createInvitationWithToken(org, invitee.email);
    await backdate(invitationId);

    const res = await api(`/organizations/${org.orgId}/invitations/${invitationId}`, {
      method: "PATCH",
      token: org.token,
      body: { action: "accept" },
    });
    expect(res.status).toBe(400);
  });

  it("allows re-inviting an email whose invitation expired", async () => {
    const org = await setupOrg();
    const email = `reinvite-${unique()}@example.com`;
    const { invitationId } = await createInvitationWithToken(org, email);
    await backdate(invitationId);

    const again = await api(`/organizations/${org.orgId}/invitations`, {
      method: "POST",
      token: org.token,
      body: { email, roleName: "Admin" },
    });
    expect(again.status).toBe(201);
  });
});
