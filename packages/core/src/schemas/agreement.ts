/** Agreement schemas (SOW / NDA / contract lifecycle). */
import { z } from "zod";
import { id, iso } from "./common";
import { userSchema } from "./auth";
import { AgreementType, AgreementStatus } from "../enums";

export const agreementSchema = z.object({
  id,
  projectId: id,
  title: z.string(),
  type: AgreementType.nullable(),
  status: AgreementStatus,
  counterparty: z.string(),
  value: z.number().nullable(),
  currency: z.string().nullable(),
  startDate: iso.nullable(),
  endDate: iso.nullable(),
  sentAt: iso.nullable(),
  signedAt: iso.nullable(),
  owner: userSchema.nullable(),
  terms: z.string().nullable(),
  createdAt: iso,
  updatedAt: iso,
});
export type Agreement = z.infer<typeof agreementSchema>;

export const agreementCreate = z.object({
  title: z.string().min(1).max(200),
  type: AgreementType.optional(),
  counterparty: z.string().min(1).max(200),
  value: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  startDate: iso.optional(),
  endDate: iso.optional(),
  ownerId: id.optional(),
  terms: z.string().max(5000).optional(),
});
export const agreementUpdate = agreementCreate.partial().extend({
  status: AgreementStatus.optional(),
  sentAt: iso.nullable().optional(),
  signedAt: iso.nullable().optional(),
});

export type AgreementCreateInput = z.input<typeof agreementCreate>;
export type AgreementUpdateInput = z.input<typeof agreementUpdate>;
