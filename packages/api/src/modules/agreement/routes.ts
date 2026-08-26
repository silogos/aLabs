/** Agreement routes — contracts/SOWs/NDAs.
 *  Rows live in Postgres (db/agreement-repo.ts). */
import { Hono } from "hono";
import * as agreementRepo from "../../db/agreement-repo";
import { agreementCreate, agreementUpdate } from "@pmin/core";
import { AGREEMENT_TRANSITIONS, canTransition } from "@pmin/core";
import { conflict, notFound } from "../../lib/errors";
import { created, data, noContent } from "../../lib/responses";
import { parseJsonBody } from "../../lib/validate";
import { projectContext, projectIdOf } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import { lifecycleStamps } from "./lifecycle";
import type { Vars } from "../../lib/ctx";

export const agreement = new Hono<{ Variables: Vars }>();
agreement.use("*", projectContext);


agreement.get("/agreements", requirePermission("agreement:view"), async (c) =>
  data(c, await agreementRepo.listAgreements(projectIdOf(c))),
);
agreement.post("/agreements", requirePermission("agreement:create"), async (c) => {
  const input = await parseJsonBody(c, agreementCreate);
  const a = await agreementRepo.insertAgreement({
    projectId: projectIdOf(c),
    title: input.title,
    type: input.type ?? "other",
    counterparty: input.counterparty,
    value: input.value ?? null,
    currency: input.currency ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    ownerId: input.ownerId ?? null,
    terms: input.terms ?? null,
  });
  return created(c, a);
});
agreement.get("/agreements/:id", requirePermission("agreement:view"), async (c) => {
  const a = await agreementRepo.getAgreement(projectIdOf(c), c.req.param("id")!);
  if (!a) throw notFound();
  return data(c, a);
});
agreement.patch("/agreements/:id", requirePermission("agreement:update"), async (c) => {
  const a = await agreementRepo.getAgreement(projectIdOf(c), c.req.param("id")!);
  if (!a) throw notFound();
  const input = await parseJsonBody(c, agreementUpdate);
  if (input.status && input.status !== a.status) {
    if (!canTransition(AGREEMENT_TRANSITIONS, a.status, input.status)) throw conflict("Invalid status transition");
  }
  const { status, sentAt, signedAt, startDate, ...rest } = input;
  await agreementRepo.patchAgreement(a.id, {
    ...rest,
    ...(status !== undefined ? { status } : {}),
    ...(startDate !== undefined ? { startDate } : {}),
    ...lifecycleStamps(a, input),
  });
  return data(c, await agreementRepo.getAgreement(projectIdOf(c), a.id));
});
agreement.delete("/agreements/:id", requirePermission("agreement:delete"), async (c) => {
  const d = await agreementRepo.getAgreement(projectIdOf(c), c.req.param("id")!);
  if (!d) throw notFound();
  await agreementRepo.softDeleteAgreement(d.id);
  return noContent(c);
});
