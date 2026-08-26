/** Documents service — spaces, pages, files, uploads. */
import type {
  Space,
  Page,
  FileRef,
  Paginated,
  PageCreateInput,
  PageUpdateInput,
  SpaceCreateInput,
} from "@pmin/core";
import { req, upload } from "@/lib/http";

export const documentsService = {
  spaces: (pid: string) =>
    req<{ data: Space[] }>(`/projects/${pid}/documents/spaces`).then((x) => x.data),

  createSpace: (pid: string, body: SpaceCreateInput) =>
    req<{ data: Space }>(`/projects/${pid}/documents/spaces`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  listPages: (pid: string) => req<Paginated<Page>>(`/projects/${pid}/documents/pages?limit=100`),

  getPage: (pid: string, id: string) =>
    req<{ data: Page }>(`/projects/${pid}/documents/pages/${id}`).then((x) => x.data),

  createPage: (pid: string, body: PageCreateInput) =>
    req<{ data: Page }>(`/projects/${pid}/documents/pages`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updatePage: (pid: string, id: string, patch: PageUpdateInput) =>
    req<{ data: Page }>(`/projects/${pid}/documents/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  removePage: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/documents/pages/${id}`, { method: "DELETE" }).then(
      () => undefined,
    ),

  /** The endpoint has shipped two shapes (`{data: []}` and bare `[]`); normalize here once. */
  files: async (pid: string): Promise<FileRef[]> => {
    const body = await req<{ data?: FileRef[] } | FileRef[]>(`/projects/${pid}/documents/files`);
    return (body as { data?: FileRef[] }).data ?? (body as FileRef[]);
  },

  /** Upload an image via multipart; returns the served URL (`/uploads/<id>`). */
  uploadFile: async (pid: string, file: File): Promise<string> => {
    const res = await upload(`/projects/${pid}/documents/files`, file);
    const body = (await res.json().catch(() => ({}))) as {
      data?: FileRef;
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(body?.error?.message ?? `Upload failed (${res.status})`);
    }
    return body.data!.url;
  },
};
