/** Optional standalone server — run the API alone (tsx src/serve.ts) without
 *  a web host. Normal development goes through the Next.js dev server, which
 *  mounts the same app in-process. */
import { serve } from "@hono/node-server";
import { app } from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env.PORT ?? 8788);
serve({ fetch: app.fetch, port }, (info) => {
  logger.info({ port: info.port }, "aLabs API listening");
});
