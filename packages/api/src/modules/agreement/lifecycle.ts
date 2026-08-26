/** Agreement lifecycle rules — status-transition side effects.
 *
 * Lifecycle stamps: sending records when (`sentAt`), acceptance
 * counter-signs (`signedAt`) and takes effect (`startDate` = today when the
 * caller didn't send an explicit date). Pure derivation from the current
 * row + the patch; the route applies the result. */
import type { z } from "zod";
import { agreementUpdate } from "@pmin/core";
import type { AgreementWithMeta } from "../../db/agreement-repo";

type AgreementPatchInput = z.infer<typeof agreementUpdate>;

/** The patch columns implied by a status change, merged with the caller's
 *  explicit values (auto-stamps only fill blanks — never override). */
export function lifecycleStamps(
  current: Pick<AgreementWithMeta, "sentAt" | "signedAt" | "startDate">,
  input: AgreementPatchInput,
): { sentAt?: Date | null; signedAt?: Date | null; startDate?: string } {
  const { status, sentAt, signedAt, startDate } = input;
  const now = new Date();
  return {
    ...(sentAt !== undefined ? { sentAt: sentAt ? new Date(sentAt) : null } : {}),
    ...(status === "sent" && !current.sentAt ? { sentAt: now } : {}),
    ...(signedAt !== undefined ? { signedAt: signedAt ? new Date(signedAt) : null } : {}),
    ...(status === "accepted" && !current.signedAt ? { signedAt: now } : {}),
    ...(status === "accepted" && !current.startDate && startDate === undefined
      ? { startDate: now.toISOString().slice(0, 10) }
      : {}),
  };
}
