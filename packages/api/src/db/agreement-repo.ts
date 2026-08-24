/** Agreement repository — Postgres (Drizzle) for agreements (SOW / NDA /
 *  contract lifecycle). Owners are hydrated Users; the numeric `value` column
 *  maps to number. */
import { and, eq, isNull } from "drizzle-orm";
import { db } from "./pg";
import { agreements } from "@pmin/core/db";
import { uuidv7, type Agreement } from "@pmin/core";
import { iso, userMap } from "./mapping";

type AgreementRow = typeof agreements.$inferSelect;

type AgreementWithOwner = Agreement & { owner: Agreement["owner"] } & { deletedAt: string | null };

async function hydrateOwners(rows: AgreementRow[]): Promise<AgreementWithOwner[]> {
  const byId = await userMap(rows.map((r) => r.ownerId));
  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    title: r.title,
    type: r.type,
    status: r.status,
    counterparty: r.counterparty,
    value: r.value === null ? null : Number(r.value),
    currency: r.currency,
    startDate: r.startDate,
    endDate: r.endDate,
    sentAt: iso(r.sentAt),
    signedAt: iso(r.signedAt),
    owner: r.ownerId ? byId.get(r.ownerId) ?? null : null,
    terms: r.terms,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deletedAt: iso(r.deletedAt),
  }));
}

export type AgreementWithMeta = Awaited<ReturnType<typeof hydrateOwners>>[number];

export async function listAgreements(projectId: string): Promise<AgreementWithMeta[]> {
  const rows = await db
    .select()
    .from(agreements)
    .where(and(eq(agreements.projectId, projectId), isNull(agreements.deletedAt)))
    .orderBy(agreements.createdAt);
  return hydrateOwners(rows);
}

export async function getAgreement(projectId: string, id: string): Promise<AgreementWithMeta | null> {
  const [row] = await db
    .select()
    .from(agreements)
    .where(and(eq(agreements.id, id), eq(agreements.projectId, projectId), isNull(agreements.deletedAt)))
    .limit(1);
  return row ? (await hydrateOwners([row]))[0]! : null;
}

export async function insertAgreement(input: {
  projectId: string;
  title: string;
  type: Agreement["type"];
  counterparty: string;
  value?: number | null;
  currency?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  ownerId?: string | null;
  terms?: string | null;
}): Promise<AgreementWithMeta> {
  const now = new Date();
  const [row] = await db
    .insert(agreements)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      title: input.title,
      type: input.type,
      status: "draft",
      counterparty: input.counterparty,
      value: input.value === null || input.value === undefined ? null : String(input.value),
      currency: input.currency ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      ownerId: input.ownerId ?? null,
      terms: input.terms ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return (await hydrateOwners([row!]))[0]!;
}

export async function patchAgreement(
  id: string,
  patch: {
    title?: string;
    type?: Agreement["type"];
    status?: Agreement["status"];
    counterparty?: string;
    value?: number | null;
    currency?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    sentAt?: Date | null;
    signedAt?: Date | null;
    ownerId?: string | null;
    terms?: string | null;
  },
): Promise<void> {
  const { value, ...rest } = patch;
  await db
    .update(agreements)
    .set({
      ...rest,
      value: value === undefined ? undefined : value === null ? null : String(value),
      updatedAt: new Date(),
    })
    .where(eq(agreements.id, id));
}

export async function softDeleteAgreement(id: string): Promise<void> {
  await db
    .update(agreements)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(agreements.id, id));
}
