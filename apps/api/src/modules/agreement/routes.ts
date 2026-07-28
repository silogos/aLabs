/** Agreement routes — contracts/SOWs/NDAs. */
import { Hono } from "hono";
import { store } from "../../db/store.js";
import { uuidv7, agreementCreate, agreementUpdate } from "@pmin/core";
import { AGREEMENT_TRANSITIONS, canTransition } from "@pmin/core";
import { conflict, notFound } from "../../lib/errors.js";
import { created, data, noContent } from "../../lib/responses.js";
import { parseBody } from "../../lib/validate.js";
import { projectContext, currentTenant } from "../../lib/tenant.js";
import { requirePermission } from "../../lib/permission.js";
import type { Vars, Ctx } from "../../lib/ctx.js";

export const agreement = new Hono<{ Variables: Vars }>();
agreement.use("*", projectContext);

const pidOf = (c: Ctx) => currentTenant(c).projectId!;

agreement.get("/agreements", requirePermission("agreement:view"), (c) =>
  data(c, store.agreements.filter((a) => a.projectId === pidOf(c) && !a.deletedAt)),
);
agreement.post("/agreements", requirePermission("agreement:create"), async (c) => {
  const input = parseBody(await c.req.json(), agreementCreate);
  const a = {
    id: uuidv7(),
    projectId: pidOf(c),
    title: input.title,
    type: input.type ?? null,
    status: "draft" as const,
    counterparty: input.counterparty,
    value: input.value ?? null,
    currency: input.currency ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    signedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null as string | null,
  };
  store.agreements.push(a);
  return created(c, a);
});
agreement.get("/agreements/:id", requirePermission("agreement:view"), (c) => {
  const a = store.agreements.find((x) => x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
  if (!a) throw notFound();
  return data(c, a);
});
agreement.patch("/agreements/:id", requirePermission("agreement:update"), async (c) => {
  const a = store.agreements.find((x) => x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
  if (!a) throw notFound();
  const input = parseBody(await c.req.json(), agreementUpdate);
  if (input.status && input.status !== a.status) {
    if (!canTransition(AGREEMENT_TRANSITIONS, a.status, input.status)) throw conflict("Invalid status transition");
  }
  Object.assign(a, input, { updatedAt: new Date().toISOString() });
  return data(c, a);
});
agreement.delete("/agreements/:id", requirePermission("agreement:delete"), (c) => {
  const d = store.agreements.find((x) => x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
  if (!d) throw notFound();
  d.deletedAt = new Date().toISOString();
  return noContent(c);
});
