/** Catch-all that mounts the Hono API in-process. Strips the /api prefix
 *  from the URL and delegates to the app — same origin as the UI, so
 *  cookies flow and no proxy is needed. */
import { app } from "@pmin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = (req: Request) => {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/api(?=\/|$)/, "") || "/";
  return app.fetch(new Request(url, req));
};

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
