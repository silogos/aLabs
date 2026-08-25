/** Agreements service — contract rows and lifecycle updates. */
import { z } from "zod";
import { agreementCreate, agreementUpdate } from "@pmin/core";
import type { Agreement } from "@pmin/core";
import { req } from "@/lib/http";

export const agreementsService = {
  list: (pid: string) =>
    req<{ data: Agreement[] }>(`/projects/${pid}/agreements`).then((x) => x.data),

  create: (pid: string, body: z.input<typeof agreementCreate>) =>
    req<{ data: Agreement }>(`/projects/${pid}/agreements`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  update: (pid: string, id: string, patch: z.input<typeof agreementUpdate>) =>
    req<{ data: Agreement }>(`/projects/${pid}/agreements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  remove: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/agreements/${id}`, { method: "DELETE" }).then(() => undefined),
};
