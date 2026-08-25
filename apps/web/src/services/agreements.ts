/** Agreements service — contract rows and lifecycle updates. */
import type {
  Agreement,
  AgreementCreateInput,
  AgreementUpdateInput,
} from "@pmin/core";
import { req } from "@/lib/http";

export const agreementsService = {
  list: (pid: string) =>
    req<{ data: Agreement[] }>(`/projects/${pid}/agreements`).then((x) => x.data),

  create: (pid: string, body: AgreementCreateInput) =>
    req<{ data: Agreement }>(`/projects/${pid}/agreements`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  update: (pid: string, id: string, patch: AgreementUpdateInput) =>
    req<{ data: Agreement }>(`/projects/${pid}/agreements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  remove: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/agreements/${id}`, { method: "DELETE" }).then(() => undefined),
};
