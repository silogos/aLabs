/** Uploads live on local disk (gitignored). The dir is cwd-relative so the
 *  standalone server and the Next.js host (cwd = apps/web) both work;
 *  UPLOADS_DIR overrides for deployments that mount a volume elsewhere. */
import { join, resolve } from "node:path";

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? resolve(process.env.UPLOADS_DIR)
  : join(process.cwd(), "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export function uploadMime(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : "";
  return MIME[ext] ?? "application/octet-stream";
}
