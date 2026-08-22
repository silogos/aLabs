/** Library entry — the Hono app, importable by hosts without starting a
 *  server. `app` matches unprefixed paths (standalone serve.ts, /uploads);
 *  `apiApp` is the same routes under /api for the Next.js catch-all route. */
import { app } from "./app";

export { app };
export const apiApp = app.basePath("/api");
