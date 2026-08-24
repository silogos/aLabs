/** Uploads live on local disk (gitignored). The dir is cwd-relative so the
 *  standalone server and the Next.js host (cwd = apps/web) both work;
 *  UPLOADS_DIR overrides for deployments that mount a volume elsewhere.
 *
 *  The extension ↔ MIME table is shared by the upload route (naming files)
 *  and /uploads/* (serving them), so accepted types are never served with a
 *  mismatched content type. */
import { join, resolve } from "node:path";

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? resolve(process.env.UPLOADS_DIR)
  : join(process.cwd(), "uploads");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

/** Content type for a stored file by extension (serving direction). */
export function uploadMime(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

/** Extension for an uploaded image (naming direction): the canonical
 *  extension for its MIME type, or the file's own extension when the type
 *  is one we serve but don't canonicalize. */
export function imageExt(mime: string, name: string): string {
  const byMime = Object.entries(MIME_BY_EXT).find(([, m]) => m === mime);
  if (byMime) return byMime[0];
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? `.${m[1]!.toLowerCase()}` : "";
}
