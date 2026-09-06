/** Agreement module — contract lifecycle (draft → sent → accepted …). */
import { describe, expect, it } from "vitest";
import { addOrgMember, api, setupProject, unique } from "./helpers";

interface AgreementRow {
  id: string;
  status: string;
  sentAt: string | null;
  signedAt: string | null;
  startDate: string | null;
}

async function createAgreement(p: { token: string; projectId: string }, title: string) {
  const res = await api(`/projects/${p.projectId}/agreements`, {
    method: "POST",
    token: p.token,
    body: { title, counterparty: "Acme Corp", type: "sow", value: 15000, currency: "USD" },
  });
  if (res.status !== 201) {
    throw new Error(`createAgreement failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: AgreementRow };
  return data;
}

describe("POST /projects/:projectId/agreements", () => {
  it("creates a draft agreement", async () => {
    const p = await setupProject();
    const agreement = await createAgreement(p, `SOW ${unique()}`);
    expect(agreement.status).toBe("draft");
    expect(agreement.sentAt).toBeNull();
  });

  it("rejects a 2-letter currency with 400", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/agreements`, {
      method: "POST",
      token: p.token,
      body: { title: "Bad currency", counterparty: "Acme", currency: "US" },
    });
    expect(res.status).toBe(400);
  });

  it("rejects a workspace Member without agreement permissions with 403", async () => {
    const org = await setupOrgSafe();
    const res = await api(`/projects/${org.projectId}/agreements`, {
      method: "POST",
      token: org.memberToken,
      body: { title: "Nope", counterparty: "Acme" },
    });
    expect(res.status).toBe(403);
  });
});

describe("GET /projects/:projectId/agreements", () => {
  it("lists and returns agreements for a member", async () => {
    const p = await setupProject();
    const agreement = await createAgreement(p, "Listed");

    const list = await api(`/projects/${p.projectId}/agreements`, { token: p.token });
    expect(list.status).toBe(200);
    const { data } = (await list.json()) as { data: { id: string }[] };
    expect(data.some((a) => a.id === agreement.id)).toBe(true);

    const get = await api(`/projects/${p.projectId}/agreements/${agreement.id}`, {
      token: p.token,
    });
    expect(get.status).toBe(200);
  });
});

describe("PATCH /projects/:projectId/agreements/:id", () => {
  it("walks draft → sent → accepted and auto-stamps the lifecycle dates", async () => {
    const p = await setupProject();
    const agreement = await createAgreement(p, "Lifecycle");
    const patch = (body: Record<string, unknown>) =>
      api(`/projects/${p.projectId}/agreements/${agreement.id}`, {
        method: "PATCH",
        token: p.token,
        body,
      });

    const sent = await patch({ status: "sent" });
    expect(sent.status).toBe(200);
    const sentRow = (await sent.json()) as { data: AgreementRow };
    expect(sentRow.data.status).toBe("sent");
    expect(sentRow.data.sentAt).not.toBeNull(); // auto-stamped on send

    const accepted = await patch({ status: "accepted" });
    expect(accepted.status).toBe(200);
    const acceptedRow = (await accepted.json()) as { data: AgreementRow };
    expect(acceptedRow.data.status).toBe("accepted");
    expect(acceptedRow.data.signedAt).not.toBeNull(); // counter-signed
    expect(acceptedRow.data.startDate).not.toBeNull(); // effective today
  });

  it("refuses an invalid transition with 409 (accepted → sent)", async () => {
    const p = await setupProject();
    const agreement = await createAgreement(p, "Terminal");
    await api(`/projects/${p.projectId}/agreements/${agreement.id}`, {
      method: "PATCH",
      token: p.token,
      body: { status: "sent" },
    });
    await api(`/projects/${p.projectId}/agreements/${agreement.id}`, {
      method: "PATCH",
      token: p.token,
      body: { status: "rejected" },
    });

    const reopen = await api(`/projects/${p.projectId}/agreements/${agreement.id}`, {
      method: "PATCH",
      token: p.token,
      body: { status: "sent" },
    });
    expect(reopen.status).toBe(409);
  });
});

describe("DELETE /projects/:projectId/agreements/:id", () => {
  it("soft-deletes the agreement", async () => {
    const p = await setupProject();
    const agreement = await createAgreement(p, "Doomed");
    const del = await api(`/projects/${p.projectId}/agreements/${agreement.id}`, {
      method: "DELETE",
      token: p.token,
    });
    expect(del.status).toBe(204);
    expect(
      (await api(`/projects/${p.projectId}/agreements/${agreement.id}`, { token: p.token }))
        .status,
    ).toBe(404);
  });
});

/** Project + a workspace Member (no agreement permissions) for the RBAC test. */
async function setupOrgSafe() {
  const p = await setupProject();
  const member = await addOrgMember({ token: p.token, orgId: p.orgId, slug: "" });
  return { ...p, memberToken: member.token };
}
