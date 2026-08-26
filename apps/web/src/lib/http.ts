/**
 * HTTP transport — the only module in the web app allowed to call fetch.
 * Services build on req(); nothing else imports this file (ESLint-enforced).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message ?? `Request failed (${res.status})`;
    // status on the error lets callers branch on 401 (expired/revoked session)
    throw new ApiError(msg, res.status);
  }
  return body as T;
}

/** Multipart upload — kept next to req() so the fetch boundary stays single. */
export async function upload(path: string, file: File): Promise<Response> {
  const fd = new FormData();
  fd.append("file", file);
  // NOTE: no Content-Type header — the browser sets the multipart boundary.
  return fetch(`/api${path}`, { method: "POST", body: fd, credentials: "include" });
}
