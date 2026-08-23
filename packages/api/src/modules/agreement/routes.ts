/** Agreement routes — contracts/SOWs/NDAs.
 *  Rows live in Postgres (db/misc-repo.ts). */
import { Hono } from "hono";
import * as miscRepo from "../../db/misc-repo";
import { agreementCreate, agreementUpdate } from "@pmin/core";
import { AGREEMENT_TRANSITIONS, canTransition } from "@pmin/core";
import { conflict, notFound } from "../../lib/errors";
import { created, data, noContent } from "../../lib/responses";
import { parseBody } from "../../lib/validate";
import { projectContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const agreement = new Hono<{ Variables: Vars }>();
agreement.use("*", projectContext);

const pidOf = (c: Ctx) => currentTenant(c).projectId!;

agreement.get("/agreements", requirePermission("agreement:view"), async (c) =>
  data(c, await miscRepo.listAgreements(pidOf(c))),
);
agreement.post("/agreements", requirePermission("agreement:create"), async (c) => {
  const input = parseBody(await c.req.json(), agreementCreate);
  const a = await miscRepo.insertAgreement({
    projectId: pidOf(c),
    title: input.title,
    type: input.type ?? "other",
    counterparty: input.counterparty,
    value: input.value ?? null,
    currency: input.currency ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
  });
  return created(c, a);
});
agreement.get("/agreements/:id", requirePermission("agreement:view"), async (c) => {
  const a = await miscRepo.getAgreement(pidOf(c), c.req.param("id")!);
  if (!a) throw notFound();
  return data(c, a);
});
agreement.patch("/agreements/:id", requirePermission("agreement:update"), async (c) => {
  const a = await miscRepo.getAgreement(pidOf(c), c.req.param("id")!);
  if (!a) throw notFound();
  const input = parseBody(await c.req.json(), agreementUpdate);
  if (input.status && input.status !== a.status) {
    if (!canTransition(AGREEMENT_TRANSITIONS, a.status, input.status)) throw conflict("Invalid status transition");
  }
  const { signedAt, ...rest } = input;
  await miscRepo.patchAgreement(a.id, {
    ...rest,
    signedAt: signedAt ? new Date(signedAt) : undefined,
  });
  return data(c, await miscRepo.getAgreement(pidOf(c), a.id));
});
agreement.delete("/agreements/:id", requirePermission("agreement:delete"), async (c) => {
  const d = await miscRepo.getAgreement(pidOf(c), c.req.param("id")!);
  if (!d) throw notFound();
  await miscRepo.softDeleteAgreement(d.id);
  return noContent(c);
});
