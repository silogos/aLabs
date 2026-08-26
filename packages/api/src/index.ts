/** Library entry — the Hono app, importable by hosts without starting a
 *  server. Hosts mount it under their own prefix (the Next.js app strips
 *  /api and delegates here; serve.ts runs it standalone). */
export { app } from "./app";
