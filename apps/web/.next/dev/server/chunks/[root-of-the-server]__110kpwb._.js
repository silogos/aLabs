module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[project]/apps/web/src/app/uploads/[...path]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "HEAD",
    ()=>handler,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
/** Uploaded images are served by the Hono app's /uploads/* route (same
 *  process) so FileRef URLs like /uploads/<id>.png keep working. */ var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/api/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$app$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/app.ts [app-route] (ecmascript)");
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
const handler = (req)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$app$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["app"].fetch(req);
;
}),
"[project]/packages/api/src/app.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "app",
    ()=>app
]);
/**
 * Hono app — mounts every module and wires the request lifecycle
 * (auth → tenant → permission → validate → handler → response/error).
 *
 * The app is host-agnostic: it runs standalone (src/serve.ts) or mounted
 * in-process by the Next.js server under /api. Same-origin only — no CORS.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$middleware$2f$logger$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/middleware/logger/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$uploads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/uploads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/seed.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$auth$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/auth/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$organization$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/organization/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$project$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/project/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$task$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/task/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$documents$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/documents/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$planning$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/planning/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$meeting$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/meeting/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$agreement$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/agreement/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$reporting$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/reporting/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$notification$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/notification/routes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$user$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/modules/user/routes.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["seed"])();
const app = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
app.use("*", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$middleware$2f$logger$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"])());
// global user resolution (best-effort; routes that need auth enforce it)
app.use("*", async (c, next)=>{
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveUser"])(c.req.raw, false);
    if (user) c.set("user", user);
    await next();
});
// Serve uploaded files (images written by the documents/files upload route)
// from local disk. Web-standard Response so it works in any host runtime.
app.get("/uploads/*", async (c)=>{
    // normalize + basename keep the path inside UPLOADS_DIR (no traversal)
    const file = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$uploads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPLOADS_DIR"], (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["basename"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["normalize"])(c.req.path)));
    try {
        const buf = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(file);
        return new Response(new Uint8Array(buf), {
            headers: {
                "content-type": (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$uploads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadMime"])(file),
                "cache-control": "public, max-age=31536000, immutable"
            }
        });
    } catch  {
        return c.json({
            error: {
                code: "not_found",
                message: "File not found"
            }
        }, 404);
    }
});
app.get("/", (c)=>c.json({
        name: "aLabs API",
        product: "Atlas Platform 2.0",
        version: "0.1.0",
        ok: true,
        endpoints: [
            "/auth",
            "/users",
            "/organizations",
            "/organizations/:organizationId/projects",
            "/projects/:projectId/tasks",
            "/projects/:projectId/documents/*",
            "/projects/:projectId/planning/*",
            "/projects/:projectId/reporting/*",
            "/notifications"
        ]
    }));
app.route("/auth", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$auth$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"]);
app.route("/users", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$user$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"]);
app.route("/organizations", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$organization$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["organization"]);
app.route("/organizations/:organizationId/projects", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$project$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["project"]);
app.route("/projects/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$project$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectMembers"]);
app.route("/projects/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$task$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["task"]);
app.route("/projects/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$documents$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documents"]);
app.route("/projects/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$planning$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planning"]);
app.route("/projects/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$meeting$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["meeting"]);
app.route("/projects/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$agreement$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["agreement"]);
app.route("/projects/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$reporting$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reporting"]);
app.route("/notifications", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$modules$2f$notification$2f$routes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notification"]);
// Standard error envelope for any thrown ApiError; everything else → 500.
app.onError((err, c)=>{
    if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]) {
        return c.json(err.toJSON(), err.httpStatus);
    }
    console.error(err);
    return c.json({
        error: {
            code: "internal_error",
            message: err.message || "Unexpected error"
        }
    }, 500);
});
app.notFound((c)=>c.json({
        error: {
            code: "not_found",
            message: "Route not found"
        }
    }, 404));
}),
"[project]/packages/api/src/db/seed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "seed",
    ()=>seed
]);
/**
 * Seed the in-memory store with the aLabs demo data — mirrors the
 * `designs/app/alabs-app.html` prototype 1:1 so the web app renders identically.
 *
 * Idempotent: `store.seeded` guards re-runs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$roles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/roles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$passwords$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/passwords.ts [app-route] (ecmascript)");
;
;
;
;
const now = ()=>new Date();
const iso = (d = now())=>d.toISOString();
function seed() {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].seeded) return;
    // Relative demo calendar — design "today" = Mar 22 in the original mock.
    // Offsets are applied from runtime-today so the board never looks stale.
    const startOfDay = (d)=>new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const TODAY = startOfDay(new Date());
    const dayIso = (offset)=>new Date(TODAY.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
    const OFFSET = {
        "Mar 18": -4,
        "Mar 19": -3,
        "Mar 20": -2,
        "Mar 21": -1,
        "Mar 22": 0,
        "Mar 23": 1,
        "Mar 24": 2,
        "Mar 25": 3,
        "Mar 26": 4,
        "Mar 27": 5,
        "Mar 28": 6,
        "Mar 29": 7,
        "Apr 01": 10,
        "Apr 02": 11,
        "Apr 10": 19,
        "Apr 12": 21,
        "Apr 15": 24,
        "Apr 16": 25,
        "Apr 18": 27,
        "Apr 20": 29,
        "Apr 25": 34,
        "Apr 28": 37
    };
    const dueIso = (label)=>OFFSET[label] !== undefined ? dayIso(OFFSET[label]) : null;
    /* ---------------- Users ---------------- */ // Demo users share a seeded password ("password123") so the login flow is
    // exercisable against the seeded data.
    const DEMO_PASSWORD = "password123";
    const seedUser = (name, email)=>{
        const u = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            name,
            email,
            image: null,
            emailVerified: true,
            createdAt: iso(),
            updatedAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.push(u);
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].accounts.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            userId: u.id,
            provider: "credential",
            providerAccountId: null,
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$passwords$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPasswordSync"])(DEMO_PASSWORD),
            createdAt: iso()
        });
        return u;
    };
    const aisha = seedUser("Aisha Yusuf", "aisha@northwind.io");
    const marco = seedUser("Marco Keller", "marco@northwind.io");
    const lin = seedUser("Lin Chen", "lin@northwind.io");
    const diego = seedUser("Diego Pereira", "diego@northwind.io");
    const sara = seedUser("Sara Reinhardt", "sara@northwind.io");
    const jonas = seedUser("Jonas Berg", "jonas@northwind.io");
    const usersByShort = {
        ay: aisha,
        mk: marco,
        lc: lin,
        dp: diego,
        sr: sara,
        jb: jonas
    };
    /* ---------------- Roles ---------------- */ for (const r of [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$roles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_WORKSPACE_ROLES"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$roles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_PROJECT_ROLES"]
    ]){
        const role = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            organizationId: null,
            scope: r.scope,
            name: r.name,
            isSystem: true,
            permissions: r.permissions
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.push(role);
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].rolePermissions[r.name] = r.permissions;
    }
    const workspaceRole = (name)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.scope === "workspace" && r.name === name);
    /* ---------------- Organizations (multi-org world for the switchers) ---------------- */ const makeOrg = (name, slug, type, description, website = null)=>{
        const o = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            name,
            slug,
            type,
            logo: null,
            description,
            timezone: "UTC",
            language: "en",
            website,
            createdAt: iso(),
            updatedAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.push(o);
        return o;
    };
    const northwind = makeOrg("Northwind", "northwind", "team", "Software House", "https://northwind.io");
    const personal = makeOrg("Personal", "personal", "personal", "Aisha's personal workspace");
    const aminStudio = makeOrg("Amin Studio", "amin-studio", "team", "Independent consultancy");
    const acme = makeOrg("Acme Internal", "acme-internal", "team", "Acme's internal product org");
    const makeMember = (org, user, roleName)=>{
        const m = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            organizationId: org.id,
            userId: user.id,
            role: workspaceRole(roleName),
            status: "active",
            joinedAt: iso(),
            user,
            createdAt: iso(),
            updatedAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.push(m);
        return m;
    };
    makeMember(northwind, aisha, "Owner");
    makeMember(northwind, marco, "Admin");
    makeMember(northwind, lin, "Member");
    makeMember(northwind, diego, "Member");
    makeMember(northwind, sara, "Member");
    makeMember(northwind, jonas, "Member");
    // Aisha's other workspaces (she is the sole member; Owner of personal by rule)
    makeMember(personal, aisha, "Owner");
    makeMember(aminStudio, aisha, "Owner");
    makeMember(acme, aisha, "Member");
    /* ---------------- Project ---------------- */ const atlas = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        organizationId: northwind.id,
        name: "Atlas Platform 2.0",
        slug: "atlas-platform-2",
        key: "ATL",
        description: "Unified delivery, documentation, planning & client portal.",
        icon: "A",
        status: "active",
        visibility: "organization",
        createdAt: iso(),
        updatedAt: iso()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.push(atlas);
    /* ---------------- Project memberships (Atlas) ----------------
   * Real project_members rows: Aisha administers, everyone else participates.
   * Behavior-neutral for the demo (Owner ∪ anything ⊇ Member), but the
   * tenant context now resolves actual roles + visibility. */ const projectRole = (name)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.scope === "project" && r.name === name);
    const projectMember = (user, roleName)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            userId: user.id,
            role: projectRole(roleName),
            status: "active",
            joinedAt: iso(),
            user,
            createdAt: iso(),
            updatedAt: iso()
        });
    };
    projectMember(aisha, "Project Admin");
    projectMember(marco, "Member");
    projectMember(lin, "Member");
    projectMember(diego, "Member");
    projectMember(sara, "Member");
    projectMember(jonas, "Member");
    /* ---------------- Task statuses (design uses 5 columns) ---------------- */ const statusDefs = [
        {
            name: "Backlog",
            order: 0,
            color: "var(--faint)",
            isDefault: false
        },
        {
            name: "To Do",
            order: 1,
            color: "var(--muted)",
            isDefault: true
        },
        {
            name: "In Progress",
            order: 2,
            color: "var(--info)",
            isDefault: false
        },
        {
            name: "In Review",
            order: 3,
            color: "var(--violet)",
            isDefault: false
        },
        {
            name: "Done",
            order: 4,
            color: "var(--ok)",
            isDefault: false
        }
    ];
    for (const s of statusDefs){
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            name: s.name,
            color: s.color,
            order: s.order,
            isDefault: s.isDefault
        });
    }
    const statusByShort = {
        backlog: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses[0],
        todo: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses[1],
        progress: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses[2],
        review: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses[3],
        done: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses[4]
    };
    const statusByName = (n)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.find((s)=>s.name === n);
    /* ---------------- Task types ---------------- */ for (const name of [
        "Task",
        "Bug",
        "Feature",
        "Epic"
    ]){
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            name
        });
    }
    const typeByShort = {
        task: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes[0],
        bug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes[1],
        feat: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes[2],
        epic: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes[3]
    };
    /* ---------------- Task labels ---------------- */ const labelNames = [
        "sso",
        "security",
        "frontend",
        "ci",
        "billing",
        "design",
        "backend",
        "search",
        "api",
        "process",
        "notifications",
        "meetings",
        "docs",
        "auth",
        "planning",
        "new"
    ];
    for (const n of labelNames){
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskLabels.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            name: n,
            color: null
        });
    }
    const labelByName = (n)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskLabels.find((l)=>l.name === n);
    /* ---------------- Iterations ---------------- */ const iter = (name, goal, start, end, status)=>{
        const it = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            name,
            goal,
            startDate: start,
            endDate: end,
            status,
            committedPoints: 0,
            completedPoints: 0,
            progress: 0,
            createdAt: iso(),
            updatedAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].iterations.push(it);
        return it;
    };
    const sprint13 = iter("Sprint 13", "Module scaffolding", dayIso(-24), dayIso(-11), "completed");
    const sprint14 = iter("Sprint 14 — SSO + Audit-log MVP", "Ship OAuth2 SSO behind a feature flag and land the immutable audit-log store. Client-portal scaffolding visible but read-only.", dayIso(-10), dayIso(4), "active");
    const sprint15 = iter("Sprint 15", null, dayIso(5), dayIso(18), "planned");
    /* ---------------- Milestones ---------------- */ const ms = (name, desc, due, status, total, done)=>{
        const m = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            name,
            description: desc,
            dueDate: due,
            status,
            totalTasks: total,
            doneTasks: done,
            progress: Math.round(done / total * 100),
            createdAt: iso(),
            updatedAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].milestones.push(m);
        return m;
    };
    const v2Beta = ms("v2.0 Beta release", "Public beta of aLabs 2.0", dayIso(6), "planned", 25, 18);
    const designSystem = ms("Design System v1", "Component library + tokens", dayIso(21), "planned", 20, 11);
    const security = ms("Security hardening", "Audit log, SSO, rate limiting", dayIso(39), "planned", 20, 6);
    const PRIO = {
        p1: "urgent",
        p2: "high",
        p3: "medium",
        p4: "low"
    };
    const designTasks = [
        {
            id: 101,
            t: "Implement OAuth2 SSO flow",
            s: "progress",
            a: "mk",
            p: "p2",
            ty: "feat",
            lb: [
                "sso",
                "security"
            ],
            due: "Mar 24",
            pts: 8,
            sub: [
                [
                    1,
                    "Spec out scopes & claims",
                    1
                ],
                [
                    2,
                    "Wire authorization-code grant",
                    0
                ],
                [
                    3,
                    "Token refresh rotation",
                    0
                ]
            ],
            com: 3
        },
        {
            id: 102,
            t: "Board drag-and-drop performance",
            s: "progress",
            a: "lc",
            p: "p3",
            ty: "feat",
            lb: [
                "frontend"
            ],
            due: "Mar 23",
            pts: 5,
            sub: [
                [
                    1,
                    "Profile with 500 cards",
                    1
                ]
            ],
            com: 2
        },
        {
            id: 103,
            t: "Fix flaky CI test on billing webhook",
            s: "review",
            a: "dp",
            p: "p1",
            ty: "bug",
            lb: [
                "ci",
                "billing"
            ],
            due: "Mar 22",
            pts: 3,
            sub: [],
            com: 4
        },
        {
            id: 104,
            t: "Design system: migrate tokens to OKLch",
            s: "todo",
            a: "jb",
            p: "p3",
            ty: "task",
            lb: [
                "design"
            ],
            due: "Mar 26",
            pts: 5,
            sub: [
                [
                    1,
                    "Audit hex usages",
                    0
                ]
            ],
            com: 1
        },
        {
            id: 105,
            t: "Audit log: immutable event store",
            s: "todo",
            a: "mk",
            p: "p2",
            ty: "feat",
            lb: [
                "security",
                "backend"
            ],
            due: "Mar 28",
            pts: 8,
            sub: [],
            com: 0
        },
        {
            id: 106,
            t: "Dashboard KPI sparkline component",
            s: "todo",
            a: "lc",
            p: "p4",
            ty: "task",
            lb: [
                "frontend"
            ],
            due: "Mar 27",
            pts: 3,
            sub: [],
            com: 0
        },
        {
            id: 107,
            t: "Role-based access at project level",
            s: "progress",
            a: "mk",
            p: "p2",
            ty: "epic",
            lb: [
                "security"
            ],
            due: "Apr 02",
            pts: 13,
            sub: [
                [
                    1,
                    "Permission matrix",
                    1
                ],
                [
                    2,
                    "Middleware guards",
                    1
                ]
            ],
            com: 5
        },
        {
            id: 108,
            t: "Search index for documents (PG trigram)",
            s: "review",
            a: "dp",
            p: "p3",
            ty: "feat",
            lb: [
                "search",
                "backend"
            ],
            due: "Mar 25",
            pts: 5,
            sub: [],
            com: 2
        },
        {
            id: 109,
            t: "Iteration planning: velocity chart",
            s: "todo",
            a: "lc",
            p: "p3",
            ty: "feat",
            lb: [
                "planning"
            ],
            due: "Mar 29",
            pts: 3,
            sub: [],
            com: 0
        },
        {
            id: 117,
            t: "API: pagination contract (cursor)",
            s: "review",
            a: "dp",
            p: "p2",
            ty: "task",
            lb: [
                "api",
                "backend"
            ],
            due: "Mar 24",
            pts: 3,
            sub: [],
            com: 1
        },
        {
            id: 116,
            t: "Backlog grooming: triage queue",
            s: "todo",
            a: "ay",
            p: "p3",
            ty: "task",
            lb: [
                "process"
            ],
            due: "Mar 22",
            pts: 2,
            sub: [],
            com: 0
        },
        {
            id: 118,
            t: "Notification digest: daily email",
            s: "todo",
            a: "lc",
            p: "p4",
            ty: "feat",
            lb: [
                "notifications"
            ],
            due: "Apr 01",
            pts: 3,
            sub: [],
            com: 0
        },
        {
            id: 112,
            t: "Reset password rate limiting",
            s: "done",
            a: "sr",
            p: "p1",
            ty: "bug",
            lb: [
                "security",
                "auth"
            ],
            due: "Mar 18",
            pts: 3,
            sub: [
                [
                    1,
                    "Add sliding window",
                    1
                ]
            ],
            com: 2
        },
        {
            id: 113,
            t: "Meeting notes: attach tasks",
            s: "done",
            a: "lc",
            p: "p4",
            ty: "task",
            lb: [
                "meetings"
            ],
            due: "Mar 19",
            pts: 2,
            sub: [],
            com: 1
        },
        {
            id: 114,
            t: "MFA: TOTP enrollment UX",
            s: "done",
            a: "sr",
            p: "p2",
            ty: "feat",
            lb: [
                "security",
                "auth"
            ],
            due: "Mar 20",
            pts: 5,
            sub: [],
            com: 3
        },
        {
            id: 115,
            t: "Empty states across modules",
            s: "done",
            a: "jb",
            p: "p4",
            ty: "task",
            lb: [
                "design"
            ],
            due: "Mar 21",
            pts: 2,
            sub: [],
            com: 0
        },
        {
            id: 119,
            t: "Write release notes for v2.0",
            s: "todo",
            a: "ay",
            p: "p3",
            ty: "task",
            lb: [
                "docs"
            ],
            due: "Mar 27",
            pts: 2,
            sub: [],
            com: 0
        },
        {
            id: 120,
            t: "Stakeholder demo prep",
            s: "todo",
            a: "ay",
            p: "p2",
            ty: "task",
            lb: [
                "process"
            ],
            due: "Mar 25",
            pts: 2,
            sub: [],
            com: 0
        },
        // Backlog items from planning view
        {
            id: 110,
            t: "Client portal: read-only views",
            s: "backlog",
            a: "ay",
            p: "p3",
            ty: "feat",
            lb: [
                "process"
            ],
            due: "Apr 10",
            pts: 5,
            sub: [],
            com: 0
        },
        {
            id: 111,
            t: "Document block model: table node",
            s: "backlog",
            a: "jb",
            p: "p3",
            ty: "task",
            lb: [
                "docs"
            ],
            due: "Apr 12",
            pts: 3,
            sub: [],
            com: 0
        },
        {
            id: 121,
            t: "Webhook retries with exponential backoff",
            s: "backlog",
            a: "lc",
            p: "p3",
            ty: "bug",
            lb: [
                "backend"
            ],
            due: "Apr 15",
            pts: 5,
            sub: [],
            com: 0
        },
        {
            id: 122,
            t: "Bulk-edit tasks from list view",
            s: "backlog",
            a: "dp",
            p: "p3",
            ty: "task",
            lb: [
                "frontend"
            ],
            due: "Apr 16",
            pts: 3,
            sub: [],
            com: 0
        },
        {
            id: 123,
            t: "Reporting: burndown export to PDF",
            s: "backlog",
            a: "sr",
            p: "p3",
            ty: "feat",
            lb: [
                "docs"
            ],
            due: "Apr 18",
            pts: 5,
            sub: [],
            com: 0
        },
        {
            id: 124,
            t: "Notification preferences per module",
            s: "backlog",
            a: "lc",
            p: "p3",
            ty: "feat",
            lb: [
                "notifications"
            ],
            due: "Apr 20",
            pts: 3,
            sub: [],
            com: 0
        },
        {
            id: 125,
            t: "SSO: SCIM user provisioning",
            s: "backlog",
            a: "mk",
            p: "p3",
            ty: "epic",
            lb: [
                "sso",
                "security"
            ],
            due: "Apr 25",
            pts: 8,
            sub: [],
            com: 0
        },
        {
            id: 126,
            t: "Empty-state illustrations (set of 6)",
            s: "backlog",
            a: "jb",
            p: "p3",
            ty: "task",
            lb: [
                "design"
            ],
            due: "Apr 28",
            pts: 2,
            sub: [],
            com: 0
        }
    ];
    for (const d of designTasks){
        const parent = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            title: d.t,
            description: null,
            statusId: statusByShort[d.s].id,
            assigneeId: usersByShort[d.a].id,
            reporterId: aisha.id,
            priority: PRIO[d.p],
            typeId: typeByShort[d.ty].id,
            parentId: null,
            iterationId: d.s === "backlog" ? null : sprint14.id,
            milestoneId: d.lb.includes("security") || d.lb.includes("sso") || d.lb.includes("auth") ? security.id : d.lb.includes("design") ? designSystem.id : v2Beta.id,
            dueDate: dueIso(d.due),
            order: d.id,
            labels: d.lb.map(labelByName),
            estimate: d.pts,
            createdAt: iso(),
            updatedAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.push(parent);
        // subtasks → real child tasks
        for (const [n, desc, done] of d.sub){
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.push({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
                projectId: atlas.id,
                title: desc,
                description: null,
                statusId: (done ? statusByName("Done") : statusByName("To Do")).id,
                assigneeId: usersByShort[d.a].id,
                reporterId: aisha.id,
                priority: PRIO[d.p],
                typeId: typeByShort[d.ty].id,
                parentId: parent.id,
                iterationId: parent.iterationId,
                milestoneId: parent.milestoneId,
                dueDate: parent.dueDate,
                order: n,
                labels: [],
                estimate: null,
                createdAt: iso(),
                updatedAt: iso()
            });
        }
    }
    // wire iteration points
    const points = (filter)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.filter((t)=>!t.parentId && filter(t)).reduce((n, t)=>n + (t.estimate ?? 0), 0);
    sprint14.committedPoints = 52;
    sprint14.completedPoints = points((t)=>t.iterationId === sprint14.id && t.statusId === statusByShort.done.id);
    sprint14.progress = Math.round(sprint14.completedPoints / sprint14.committedPoints * 100);
    sprint13.committedPoints = points((t)=>t.iterationId === sprint13.id);
    sprint13.completedPoints = sprint13.committedPoints;
    sprint13.progress = 100;
    /* ---------------- Document spaces + pages ---------------- */ const spaces = (name, icon, order)=>{
        const s = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            name,
            icon,
            order,
            createdAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].spaces.push(s);
        return s;
    };
    const product = spaces("Product", "📐", 0);
    const engineering = spaces("Engineering", "⚙️", 1);
    const design = spaces("Design", "🎨", 2);
    const client = spaces("Client", "🤝", 3);
    const legal = spaces("Legal", "⚖️", 4);
    const page = (space, title, icon, content)=>{
        const p = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            spaceId: space.id,
            parentId: null,
            title,
            content,
            icon,
            order: 0,
            createdAt: iso(),
            updatedAt: iso(),
            editedBy: marco
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].pages.push(p);
        return p;
    };
    /* ProseMirror doc builders for seed page content (native JSON — no adapter). */ const txt = (t)=>({
            type: "text",
            text: t
        });
    const para = (t)=>({
            type: "paragraph",
            content: [
                txt(t)
            ]
        });
    const hd = (level, t)=>({
            type: "heading",
            attrs: {
                level
            },
            content: [
                txt(t)
            ]
        });
    const bq = (t)=>({
            type: "blockquote",
            content: [
                para(t)
            ]
        });
    const cblk = (language, t)=>({
            type: "codeBlock",
            attrs: {
                language
            },
            content: [
                txt(t)
            ]
        });
    const ul = (...items)=>({
            type: "bulletList",
            content: items.map((i)=>({
                    type: "listItem",
                    content: [
                        para(i)
                    ]
                }))
        });
    const doc = (...blocks)=>({
            type: "doc",
            content: blocks
        });
    page(product, "Vision & positioning", "🎯", doc(hd(2, "Vision"), para("A project management platform purpose-built for software delivery — simple enough for a two-person team, scalable enough for an enterprise. Most tools track tasks or store documents. aLabs unifies delivery, documentation, planning, and client communication in one place."), bq("AI is an optional enhancement, never the core experience. Every feature works without it."), hd(2, "Differentiators"), ul("Documentation is a first-class citizen", "Built-in client transparency", "Seat-free pricing — we charge for value", "Refine ICP sizing assumptions")));
    page(engineering, "Architecture", "🏛️", doc(bq("Source of truth. This doc governs all module work. ADRs live under Engineering → ADRs; changes here require an ADR."), hd(2, "Hierarchy"), para("aLabs is strictly hierarchical: User → Organization → Project → Modules. Every business activity belongs to a Project — nothing floats free. Data is isolated per organization; multi-tenancy is enforced at the database layer, not the application layer."), hd(2, "Foundation & modules"), para("A shared Foundation (Authentication, Organization, Project) underpins every module. Delivery modules (Task, Planning) and Knowledge modules (Documents) build on it directly."), ul("Define the tenancy boundary at the org level", "Scope every module to a project", "Document the read-replica strategy for reporting"), hd(2, "Stack"), ul("Frontend · React · TypeScript — large hiring pool, end-to-end type safety", "Backend · Hono — lightweight, edge-ready, fast", "Database · PostgreSQL — relational integrity for hierarchical multi-tenant data", "ORM · Drizzle — SQL-first, predictable, type-safe", "Auth · Better Auth — sessions & organizations without a managed vendor"), bq("Open decision. Object storage & search providers are still TBD — see Pending Decisions in the README.")));
    page(engineering, "Data model", "🗄️", doc(hd(2, "Core entities"), para("Tasks, Documents, Planning, and Meetings each own their tables, scoped by projectId. There are no cross-project foreign keys."), cblk("sql", "-- task is the primary unit of execution\nCREATE TABLE task (\n  id          uuid PRIMARY KEY,\n  project_id  uuid NOT NULL REFERENCES project,\n  title       text NOT NULL,\n  status_id   uuid NOT NULL REFERENCES task_status,\n  assignee_id uuid,\n  priority    task_priority NOT NULL DEFAULT 'medium',\n  due_date    timestamptz,\n  CONSTRAINT within_project CHECK (...)\n);"), bq("Subtasks are self-referential via parent_id; progress rolls up to the parent."), para("See the full schema in 03-data-model.md.")));
    page(engineering, "API contract", "🔌", doc(hd(2, "Conventions"), para("RESTful, JSON, cursor-based pagination. Every route is scoped under an organization and project."), cblk("http", "# list tasks in a project\nGET /orgs/{orgId}/projects/{projectId}/tasks\n     ?status=progress&assignee=me&cursor={cursor}\n\n# 200 OK\n{ \"data\": [...], \"nextCursor\": \"...\", \"hasMore\": true }"), para("Every endpoint is guarded by a capability check: task:view, task:create, document:update, and so on. Capabilities are derived from the member's role in the org and project.")));
    page(product, "Roadmap", "🗺️", doc(hd(2, "Phasing"), para("Phase 1 Foundation → Phase 2 Task & Documents → Phase 3 Planning & Meetings → Phase 4 Client portal & Governance → Phase 5 Notifications & Billing → Phase 6 AI add-on."), ul("Foundation shipped", "Task & Documents in beta", "Planning module — active sprint")));
    page(product, "Pricing model", "💲", doc(para("Seat-free. We charge for projects and features, not people.")));
    page(product, "Personas", "👥", doc(para("Product Manager, Project Manager, Business Analyst, Software Engineer, QA Engineer, UI/UX Designer.")));
    page(engineering, "ADRs", "📋", doc(para("Architecture Decision Records live here.")));
    page(engineering, "Conventions", "📜", doc(hd(2, "Coding standards"), para("TypeScript strict mode everywhere, no any without an inline justification. Naming is camelCase for code, snake_case for database columns."), bq("Every architectural decision gets an ADR before the PR merges.")));
    page(design, "Design system", "🎨", doc(para("Tokens, type scale, and component primitives.")));
    page(design, "Component library", "🧩", doc(para("React component library shared across the app.")));
    page(client, "Northwind SOW", "📄", doc(para("Statement of work for the Atlas Platform 2.0 engagement.")));
    page(client, "Status report — Mar", "📊", doc(para("March status report shared with the client.")));
    page(legal, "Master services agreement", "📑", doc(para("MSA between Northwind and the client.")));
    /* ---------------- Files ---------------- */ const file = (name, mimeType, size, icon, uploadedBy)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].files.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: atlas.id,
            name,
            mimeType,
            size,
            url: `files/${icon}/${name}`,
            uploadedBy,
            createdAt: iso()
        });
    };
    file("design-system.fig", "application/figma", 24100000, "fig", jonas);
    file("northwind-sow.pdf", "application/pdf", 880000, "pdf", aisha);
    file("data-model-v3.png", "image/png", 1200000, "img", diego);
    file("openapi.yaml", "text/yaml", 96000, "yml", marco);
    file("brand-guidelines.pdf", "application/pdf", 12000000, "doc", jonas);
    file("assets-export.zip", "application/zip", 8400000, "zip", lin);
    /* ---------------- Activity feed ---------------- */ const activity = (kind, actor, target, whenLabel, minutesAgo)=>{
        const e = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            kind,
            projectId: atlas.id,
            actorId: usersByShort[actor].id,
            target,
            when: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
            whenLabel
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].activity.push(e);
        return e;
    };
    activity("move", "mk", "ATL-101", "12 minutes ago", 12);
    activity("doc", "jb", "Design System v1", "38 minutes ago", 38);
    activity("com", "dp", "ATL-103", "1 hour ago", 60);
    activity("done", "sr", "ATL-112", "2 hours ago", 120);
    activity("mile", "ay", "Security hardening", "3 hours ago", 180);
    activity("done", "lc", "ATL-113", "5 hours ago", 300);
    /* ---------------- Notifications ---------------- */ __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].notifications.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        userId: aisha.id,
        type: "mention",
        title: "Marco mentioned you on ATL-101",
        body: "Can you review the PKCE verifier before EOD?",
        link: "/tasks/101",
        readAt: null,
        createdAt: iso()
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].notifications.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        userId: aisha.id,
        type: "due",
        title: "ATL-116 is due today",
        body: "Backlog grooming: triage queue",
        link: "/tasks/116",
        readAt: null,
        createdAt: iso()
    });
    /* ---------------- Demo session (auto-login as Aisha) ---------------- */ __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].sessions.push({
        token: "demo-" + aisha.id,
        userId: aisha.id,
        expiresAt: new Date(Date.now() + 365 * 86_400_000).toISOString(),
        createdAt: iso()
    });
    /* ---------------- Comments (for the task drawer) ---------------- */ const ssoTask = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.find((t)=>t.title === "Implement OAuth2 SSO flow" && !t.parentId);
    if (ssoTask) {
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].comments.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            taskId: ssoTask.id,
            userId: marco.id,
            body: "Blocked on the IdP sandbox credentials — chasing Ops. Unblocked scope: PKCE verifier generation is done.",
            createdAt: new Date(Date.now() - 2 * 3600_000).toISOString()
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].comments.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            taskId: ssoTask.id,
            userId: sara.id,
            body: "Added a regression test for expired refresh tokens. Looks clean on staging.",
            createdAt: new Date(Date.now() - 26 * 3600_000).toISOString()
        });
    }
    /* ---------------- Other projects (minimal shape so switching lands on a
     usable board — statuses + a few tasks each; only Atlas is fully seeded) ---------------- */ const sideProject = (org, name, slug, key, icon, titles)=>{
        const p = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            organizationId: org.id,
            name,
            slug,
            key,
            description: null,
            icon,
            status: "active",
            visibility: "organization",
            createdAt: iso(),
            updatedAt: iso()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.push(p);
        const statuses = statusDefs.map((s)=>({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
                projectId: p.id,
                name: s.name,
                color: s.color,
                order: s.order,
                isDefault: s.isDefault
            }));
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.push(...statuses);
        titles.forEach(([title, si], i)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.push({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
                projectId: p.id,
                title,
                description: null,
                statusId: statuses[si].id,
                assigneeId: aisha.id,
                reporterId: aisha.id,
                priority: "medium",
                typeId: null,
                parentId: null,
                iterationId: null,
                milestoneId: null,
                dueDate: null,
                order: i,
                labels: [],
                estimate: null,
                createdAt: iso(),
                updatedAt: iso()
            });
        });
        return p;
    };
    const mobile = sideProject(northwind, "Mobile App v1", "mobile-app-v1", "MOB", "M", [
        [
            "Set up React Native scaffold",
            4
        ],
        [
            "Push notifications proof of concept",
            2
        ],
        [
            "Offline task cache",
            1
        ],
        [
            "App Store screenshots",
            0
        ]
    ]);
    sideProject(personal, "Notes", "notes", "NOT", "N", [
        [
            "Reading list: shipping for startups",
            1
        ],
        [
            "Weekly review template",
            4
        ],
        [
            "Ideas parking lot",
            0
        ]
    ]);
    sideProject(aminStudio, "Data Warehouse", "data-warehouse", "DWH", "D", [
        [
            "Source-system inventory",
            4
        ],
        [
            "Model dim_customer v1",
            2
        ],
        [
            "Nightly ELT failure alerts",
            1
        ],
        [
            "Backfill 2025 orders",
            0
        ]
    ]);
    sideProject(aminStudio, "Brand Refresh", "brand-refresh", "BRD", "B", [
        [
            "Logo explorations round 2",
            2
        ],
        [
            "Typography shortlist",
            1
        ],
        [
            "Website color tokens",
            0
        ],
        [
            "Stakeholder review deck",
            1
        ]
    ]);
    sideProject(acme, "Marketing Site", "marketing-site", "MKT", "M", [
        [
            "Pricing page copy",
            2
        ],
        [
            "CMS migration plan",
            1
        ],
        [
            "SEO audit fixes",
            4
        ],
        [
            "Launch checklist",
            0
        ]
    ]);
    sideProject(acme, "Ops Automation", "ops-automation", "OPS", "O", [
        [
            "Invoice sync job",
            2
        ],
        [
            "Onboarding runbook",
            4
        ],
        [
            "Alert routing rules",
            1
        ],
        [
            "Quarterly access review",
            0
        ]
    ]);
    /* ---------------- Recents (pre-seeded so the "Recent" group renders) ----------------
   * Atlas is the most recent visit → the derived landing project for Northwind
   * is the fully-seeded demo project. */ __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectVisits.push({
        userId: aisha.id,
        projectId: mobile.id,
        visitedAt: new Date(Date.now() - 2 * 86_400_000).toISOString()
    }, {
        userId: aisha.id,
        projectId: atlas.id,
        visitedAt: new Date(Date.now() - 1 * 86_400_000).toISOString()
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].seeded = true;
}
}),
"[project]/packages/api/src/db/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * In-memory repository — the runtime data layer.
 *
 * This stands in for PostgreSQL/Drizzle so the app is fully runnable without a
 * database. The Drizzle schema in `@pmin/core/db` is the documented source of
 * truth; this store mirrors those tables with the same tenant columns and is
 * structured so a real Drizzle repository could drop in behind the same service
 * layer.
 *
 * Multi-tenancy rule (`docs/tech/02-conventions.md`): every tenant-scoped query
 * MUST filter by organization_id / project_id. The helpers here enforce that.
 */ __turbopack_context__.s([
    "store",
    ()=>store
]);
const store = {
    users: [],
    organizations: [],
    roles: [],
    members: [],
    invitations: [],
    projectMembers: [],
    projects: [],
    taskStatuses: [],
    taskTypes: [],
    taskLabels: [],
    tasks: [],
    iterations: [],
    milestones: [],
    spaces: [],
    pages: [],
    files: [],
    notifications: [],
    meetings: [],
    agreements: [],
    comments: [],
    activity: [],
    sessions: [],
    accounts: [],
    passwordResets: [],
    projectVisits: [],
    rolePermissions: {},
    seeded: false
};
}),
"[project]/packages/api/src/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/** Library entry — the Hono app, importable by hosts without starting a
 *  server. Hosts mount it under their own prefix (the Next.js app strips
 *  /api and delegates here; serve.ts runs it standalone). */ var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$app$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/app.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/api/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Session + auth resolution — a valid session (cookie or bearer) or nothing. */ __turbopack_context__.s([
    "extractToken",
    ()=>extractToken,
    "requireAuth",
    ()=>requireAuth,
    "resolveUser",
    ()=>resolveUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
;
;
function extractToken(req) {
    const auth = req.headers.get("authorization");
    if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
    const cookie = req.headers.get("cookie") ?? "";
    const m = cookie.match(/(?:^|;\s*)alabs_session=([^;]+)/);
    if (m) return m[1];
    return null;
}
;
function resolveUser(req, require = true) {
    const token = extractToken(req);
    const now = Date.now();
    const session = token ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].sessions.find((s)=>s.token === token && Date.parse(s.expiresAt) > now) : null;
    if (session) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.find((u)=>u.id === session.userId) ?? null;
    }
    if (require) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])();
    return null;
}
const requireAuth = async (c, next)=>{
    const user = resolveUser(c.req.raw, true);
    if (user) c.set("user", user);
    await next();
};
}),
"[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "badRequest",
    ()=>badRequest,
    "conflict",
    ()=>conflict,
    "forbidden",
    ()=>forbidden,
    "notFound",
    ()=>notFound,
    "unauthorized",
    ()=>unauthorized
]);
/** Standard API error. Maps to the error envelope + status from conventions. */ var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
;
class ApiError extends Error {
    code;
    details;
    status;
    constructor(code, message, details, status){
        super(message), this.code = code, this.details = details, this.status = status;
    }
    get httpStatus() {
        return this.status ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ERROR_STATUS"][this.code];
    }
    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                details: this.details
            }
        };
    }
}
const badRequest = (m, d)=>new ApiError("validation_error", m, d);
const unauthorized = (m = "Not authenticated")=>new ApiError("unauthorized", m);
const forbidden = (m = "Forbidden")=>new ApiError("forbidden", m);
const notFound = (m = "Not found")=>new ApiError("not_found", m);
const conflict = (m, d)=>new ApiError("conflict", m, d);
}),
"[project]/packages/api/src/lib/passwords.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "hashPasswordSync",
    ()=>hashPasswordSync,
    "verifyPassword",
    ()=>verifyPassword
]);
/**
 * Password hashing — scrypt via Node's built-in crypto (no extra deps), stored
 * as `scrypt:<salt>:<hash>` (same shape Better Auth uses, so credential rows
 * migrate cleanly when the Postgres/Better Auth swap happens).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$util__$5b$external$5d$__$28$node$3a$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:util [external] (node:util, cjs)");
;
;
const scrypt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$util__$5b$external$5d$__$28$node$3a$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["scrypt"]);
const KEYLEN = 64;
async function hashPassword(password) {
    const salt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16);
    const hash = await scrypt(password, salt, KEYLEN);
    return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}
function hashPasswordSync(password) {
    const salt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16);
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["scryptSync"])(password, salt, KEYLEN);
    return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}
async function verifyPassword(password, stored) {
    const [scheme, saltB64, hashB64] = stored.split(":");
    if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
    try {
        const expected = Buffer.from(hashB64, "base64");
        const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(expected, actual);
    } catch  {
        return false;
    }
}
}),
"[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** `requirePermission(key)` — RBAC check on the effective permission set. */ __turbopack_context__.s([
    "requirePermission",
    ()=>requirePermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
;
function requirePermission(key) {
    return async (c, next)=>{
        const tenant = c.get("tenant");
        // Outside a tenant route (e.g. /auth, /notifications) → allow (auth-only).
        if (!tenant) return await next();
        if (!tenant.permissions.has(key)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["forbidden"])();
        await next();
    };
}
}),
"[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Response helpers — wrap payloads in the standard envelopes. */ __turbopack_context__.s([
    "created",
    ()=>created,
    "data",
    ()=>data,
    "noContent",
    ()=>noContent,
    "paginated",
    ()=>paginated
]);
const data = (c, body, status = 200)=>c.json({
        data: body
    }, status);
const paginated = (c, p)=>c.json(p, 200);
const noContent = (c)=>c.body(null, 204);
const created = (c, body)=>data(c, body, 201);
}),
"[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Tenant context middleware — `tenantContext` per the request lifecycle
 * (`docs/tech/01-architecture.md`).
 *
 *   1. resolve :organizationId → verify caller is a member (else 404, never 403)
 *   2. optionally resolve :projectId → verify it belongs to that org + caller is
 *      a project member; compute the *effective* permission set =
 *      workspace role ∪ project role
 */ __turbopack_context__.s([
    "currentTenant",
    ()=>currentTenant,
    "orgContext",
    ()=>orgContext,
    "projectContext",
    ()=>projectContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
;
;
const orgContext = async (c, next)=>{
    const user = c.get("user");
    if (!user) return await next();
    const organizationId = c.req.param("organizationId");
    const org = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.find((o)=>o.id === organizationId && !o.deletedAt);
    if (!org) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const member = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.find((m)=>m.organizationId === org.id && m.userId === user.id && m.status === "active");
    // 404 (not 403) to avoid leaking existence outside the tenant.
    if (!member) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const ctx = {
        organizationId: org.id,
        workspaceRole: member.role.name,
        permissions: new Set(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].rolePermissions[member.role.name] ?? [])
    };
    c.set("tenant", ctx);
    await next();
};
const projectContext = async (c, next)=>{
    const user = c.get("user");
    if (!user) return await next();
    const projectId = c.req.param("projectId");
    const project = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.find((p)=>p.id === projectId && !p.deletedAt);
    if (!project) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    // must be an active org member to access any project
    const orgMember = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.find((m)=>m.organizationId === project.organizationId && m.userId === user.id && m.status === "active");
    if (!orgMember) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    // project membership (optional): pending invitations grant nothing yet
    const pm = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.find((m)=>m.projectId === project.id && m.userId === user.id && m.status === "active");
    if (project.visibility === "private" && !pm) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const wsPerms = new Set(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].rolePermissions[orgMember.role.name] ?? []);
    if (pm) for (const p of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].rolePermissions[pm.role.name] ?? [])wsPerms.add(p);
    const ctx = {
        organizationId: project.organizationId,
        projectId: project.id,
        workspaceRole: orgMember.role.name,
        projectRole: pm?.role.name,
        permissions: wsPerms
    };
    c.set("tenant", ctx);
    await next();
};
function currentTenant(c) {
    const t = c.get("tenant");
    if (!t) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    return t;
}
}),
"[project]/packages/api/src/lib/uploads.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UPLOADS_DIR",
    ()=>UPLOADS_DIR,
    "uploadMime",
    ()=>uploadMime
]);
/** Uploads live on local disk (gitignored). The dir is cwd-relative so the
 *  standalone server and the Next.js host (cwd = apps/web) both work;
 *  UPLOADS_DIR overrides for deployments that mount a volume elsewhere. */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
const UPLOADS_DIR = process.env.UPLOADS_DIR ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(process.env.UPLOADS_DIR) : (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(process.cwd(), "uploads");
const MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf"
};
function uploadMime(filename) {
    const dot = filename.lastIndexOf(".");
    const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : "";
    return MIME[ext] ?? "application/octet-stream";
}
}),
"[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** zod validators — parse request bodies, query strings, and params. */ __turbopack_context__.s([
    "parseBody",
    ()=>parseBody,
    "parseQuery",
    ()=>parseQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
;
function parseBody(value, schema) {
    const res = schema.safeParse(value);
    if (!res.success) {
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])(res.error.issues[0]?.message ?? "Invalid input", {
            issues: res.error.issues
        });
    }
    return res.data;
}
function parseQuery(qs, schema) {
    const res = schema.safeParse(qs);
    if (!res.success) {
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])(res.error.issues[0]?.message ?? "Invalid query", {
            issues: res.error.issues
        });
    }
    return res.data;
}
}),
"[project]/packages/api/src/modules/agreement/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agreement",
    ()=>agreement
]);
/** Agreement routes — contracts/SOWs/NDAs. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/state-machines.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const agreement = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
agreement.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"]);
const pidOf = (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).projectId;
agreement.get("/agreements", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("agreement:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].agreements.filter((a)=>a.projectId === pidOf(c) && !a.deletedAt)));
agreement.post("/agreements", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("agreement:create"), async (c)=>{
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["agreementCreate"]);
    const a = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pidOf(c),
        title: input.title,
        type: input.type ?? null,
        status: "draft",
        counterparty: input.counterparty,
        value: input.value ?? null,
        currency: input.currency ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        signedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].agreements.push(a);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, a);
});
agreement.get("/agreements/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("agreement:view"), (c)=>{
    const a = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].agreements.find((x)=>x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
    if (!a) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, a);
});
agreement.patch("/agreements/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("agreement:update"), async (c)=>{
    const a = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].agreements.find((x)=>x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
    if (!a) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["agreementUpdate"]);
    if (input.status && input.status !== a.status) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canTransition"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AGREEMENT_TRANSITIONS"], a.status, input.status)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("Invalid status transition");
    }
    Object.assign(a, input, {
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, a);
});
agreement.delete("/agreements/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("agreement:delete"), (c)=>{
    const d = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].agreements.find((x)=>x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
    if (!d) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    d.deletedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
}),
"[project]/packages/api/src/modules/auth/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth
]);
/**
 * Auth routes — session-based, demo-friendly.
 *
 * Contract: docs/foundation/01-authentication.md. Sessions are opaque tokens
 * (cookie or Bearer) backed by the in-memory store; passwords are scrypt
 * hashes (lib/passwords.ts). Until the Postgres/Better Auth swap, OAuth state
 * and reset tokens also live in memory — fine for a single-node prototype.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$helper$2f$cookie$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/helper/cookie/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$passwords$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/passwords.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const auth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const SESSION_COOKIE = "alabs_session";
/* ---------------- helpers ---------------- */ function issueSession(c, userId) {
    const token = "sess-" + (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(24).toString("base64url");
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].sessions.push({
        token,
        userId,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
        createdAt: new Date().toISOString()
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$helper$2f$cookie$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setCookie"])(c, SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "Lax",
        path: "/"
    });
    return token;
}
/** Create a user + their personal workspace (org of one) — signup path shared
 * by register and Google SSO. See docs/foundation/04-plans-workspaces.md and
 * ADR 0007: personal orgs block invites and cap projects. */ function createUserWithWorkspace(input) {
    const now = new Date().toISOString();
    const user = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        name: input.name,
        email: input.email,
        image: input.image,
        emailVerified: input.emailVerified,
        createdAt: now,
        updatedAt: now
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.push(user);
    const ownerRole = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === "Owner" && r.scope === "workspace");
    const personalOrg = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        name: `${input.name}'s Workspace`,
        slug: `personal-${user.id.slice(-8)}`,
        type: "personal",
        logo: null,
        description: null,
        timezone: "UTC",
        language: "en",
        website: null,
        createdAt: now,
        updatedAt: now
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.push(personalOrg);
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        organizationId: personalOrg.id,
        userId: user.id,
        role: ownerRole,
        status: "active",
        joinedAt: now,
        user,
        createdAt: now,
        updatedAt: now
    });
    return user;
}
/* ---------------- email + password ---------------- */ auth.post("/register", async (c)=>{
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerInput"]);
    const existing = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.find((u)=>u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Email already registered");
    const user = createUserWithWorkspace({
        name: input.name,
        email: input.email,
        image: null,
        emailVerified: false
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].accounts.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        userId: user.id,
        provider: "credential",
        providerAccountId: null,
        passwordHash: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$passwords$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(input.password),
        createdAt: new Date().toISOString()
    });
    const token = issueSession(c, user.id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        user,
        token
    }, 201);
});
auth.post("/login", async (c)=>{
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginInput"]);
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.find((u)=>u.email.toLowerCase() === input.email.toLowerCase());
    const account = user ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].accounts.find((a)=>a.userId === user.id && a.provider === "credential") : undefined;
    const ok = account?.passwordHash ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$passwords$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPassword"])(input.password, account.passwordHash) : false;
    if (!user || !ok) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])("Invalid email or password");
    const token = issueSession(c, user.id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        user,
        token
    });
});
auth.post("/logout", async (c)=>{
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractToken"])(c.req.raw);
    if (token) __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].sessions = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].sessions.filter((s)=>s.token !== token);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$helper$2f$cookie$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCookie"])(c, SESSION_COOKIE, {
        path: "/"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        ok: true
    });
});
auth.get("/me", async (c)=>{
    const user = c.get("user");
    if (!user) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, user);
});
/* ---------------- forgot / reset password ---------------- */ auth.post("/forgot-password", async (c)=>{
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["forgotPasswordInput"]);
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.find((u)=>u.email.toLowerCase() === input.email.toLowerCase());
    // Always 200 — never reveal whether the email exists.
    if (!user) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        ok: true
    });
    const token = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(24).toString("base64url");
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].passwordResets.push({
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TTL_MS).toISOString(),
        usedAt: null,
        createdAt: new Date().toISOString()
    });
    const resetUrl = `/reset-password?token=${token}`;
    // No email provider wired yet (EMAIL_* is unselected — see .env.example), so
    // log the link as the stand-in. Returned outside production so the flow is
    // testable end-to-end.
    console.log(`[auth] password reset for ${user.email}: ${resetUrl}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        ok: true,
        ...("TURBOPACK compile-time truthy", 1) ? {
            resetPath: resetUrl
        } : "TURBOPACK unreachable"
    });
});
auth.post("/reset-password", async (c)=>{
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resetPasswordInput"]);
    const reset = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].passwordResets.find((r)=>r.token === input.token && !r.usedAt && Date.parse(r.expiresAt) > Date.now());
    if (!reset) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Invalid or expired reset token");
    const account = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].accounts.find((a)=>a.userId === reset.userId && a.provider === "credential");
    const passwordHash = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$passwords$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(input.password);
    if (account) {
        account.passwordHash = passwordHash;
    } else {
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].accounts.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            userId: reset.userId,
            provider: "credential",
            providerAccountId: null,
            passwordHash,
            createdAt: new Date().toISOString()
        });
    }
    // Single-use token + kill every active session (they may be compromised).
    reset.usedAt = new Date().toISOString();
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].sessions = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].sessions.filter((s)=>s.userId !== reset.userId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        ok: true
    });
});
/* ---------------- Google SSO ---------------- */ const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
/** Pending OAuth states (CSRF protection) — state → expiresAt. */ const oauthStates = new Map();
const googleConfig = ()=>{
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return clientId && clientSecret ? {
        clientId,
        clientSecret
    } : null;
};
const webUrl = ()=>process.env.WEB_URL ?? "http://localhost:3000";
/** The OAuth redirect URI registered with Google. The app serves the API
 *  under /api (Next.js in-process mount), so the callback lives there. */ const googleRedirectUri = ()=>`${webUrl()}/api/auth/oauth/google/callback`;
/** Kick off the flow: redirect to Google's consent screen. */ auth.get("/oauth/google", (c)=>{
    const cfg = googleConfig();
    if (!cfg) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"]("service_unavailable", "Google SSO is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
    }
    const state = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(24).toString("base64url");
    oauthStates.set(state, Date.now() + OAUTH_STATE_TTL_MS);
    const redirectUri = googleRedirectUri();
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", cfg.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return c.redirect(url.toString());
});
/** Google redirects back here with ?code&state (or ?error). */ auth.get("/oauth/google/callback", async (c)=>{
    const fail = (reason)=>c.redirect(`${webUrl()}/login?authError=${encodeURIComponent(reason)}`);
    const code = c.req.query("code");
    const error = c.req.query("error");
    const state = c.req.query("state");
    if (error) return fail(error);
    if (!code || !state) return fail("missing_code_or_state");
    const stateExpiresAt = oauthStates.get(state);
    oauthStates.delete(state);
    if (!stateExpiresAt || stateExpiresAt < Date.now()) return fail("invalid_state");
    const cfg = googleConfig();
    if (!cfg) return fail("google_not_configured");
    // Exchange the code for an access token.
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: googleRedirectUri()
        })
    });
    if (!tokenRes.ok) return fail("token_exchange_failed");
    const { access_token } = await tokenRes.json();
    if (!access_token) return fail("token_exchange_failed");
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });
    if (!profileRes.ok) return fail("userinfo_failed");
    const profile = await profileRes.json();
    if (!profile.email) return fail("email_missing");
    // Upsert by email; link the Google account to the user.
    let user = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.find((u)=>u.email.toLowerCase() === profile.email.toLowerCase());
    if (!user) {
        user = createUserWithWorkspace({
            name: profile.name ?? profile.email.split("@")[0],
            email: profile.email,
            image: profile.picture ?? null,
            emailVerified: profile.email_verified ?? true
        });
    }
    const linked = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].accounts.find((a)=>a.userId === user.id && a.provider === "google");
    if (linked) {
        linked.providerAccountId = profile.sub;
    } else {
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].accounts.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            userId: user.id,
            provider: "google",
            providerAccountId: profile.sub,
            passwordHash: null,
            createdAt: new Date().toISOString()
        });
    }
    issueSession(c, user.id);
    return c.redirect(webUrl());
});
}),
"[project]/packages/api/src/modules/documents/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "documents",
    ()=>documents
]);
/** Documents routes — spaces, pages (with revisions), files, search. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$uploads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/uploads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/content.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const documents = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
documents.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"]);
const pidOf = (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).projectId;
// ---- file uploads (images) ----
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const IMAGE_EXT = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/x-icon": ".ico"
};
function extFromName(name) {
    const m = name.match(/\.([a-z0-9]+)$/i);
    return m ? `.${m[1].toLowerCase()}` : undefined;
}
// ---- spaces ----
documents.get("/documents/spaces", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].spaces.filter((s)=>s.projectId === pidOf(c) && !s.deletedAt).sort((a, b)=>a.order - b.order)));
documents.post("/documents/spaces", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:create"), async (c)=>{
    const pid = pidOf(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spaceCreate"]);
    const s = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pid,
        name: input.name,
        icon: input.icon ?? null,
        order: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].spaces.filter((s)=>s.projectId === pid).length,
        createdAt: new Date().toISOString(),
        deletedAt: null
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].spaces.push(s);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, s);
});
// ---- pages ----
documents.get("/documents/pages", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:view"), (c)=>{
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuery"])(c.req.query(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginationQuery"]);
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].pages.filter((p)=>p.projectId === pidOf(c) && !p.deletedAt).sort((a, b)=>a.title.localeCompare(b.title));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginated"])(c, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginate"])(rows, q));
});
documents.post("/documents/pages", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:create"), async (c)=>{
    const user = c.get("user");
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageCreate"]);
    const space = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].spaces.find((s)=>s.id === input.spaceId && s.projectId === pidOf(c));
    if (!space) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])("Space not found");
    const page = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pidOf(c),
        spaceId: input.spaceId,
        parentId: input.parentId ?? null,
        title: input.title,
        content: {
            type: "doc",
            content: [
                {
                    type: "paragraph"
                }
            ]
        },
        icon: input.icon ?? null,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedBy: user
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].pages.push(page);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, page);
});
documents.get("/documents/pages/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:view"), (c)=>{
    const p = findPage(c);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, p);
});
documents.patch("/documents/pages/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:update"), async (c)=>{
    const user = c.get("user");
    const p = findPage(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageUpdate"]);
    if (input.updatedAt && input.updatedAt !== p.updatedAt) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("Page was modified");
    if (input.content) {
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["contentSchema"].safeParse(input.content);
        if (!parsed.success) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Invalid page content");
    }
    for (const k of [
        "spaceId",
        "parentId",
        "title",
        "icon"
    ]){
        if (input[k] !== undefined) p[k] = input[k];
    }
    if (input.content) p.content = input.content;
    p.updatedAt = new Date().toISOString();
    p.editedBy = user;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, p);
});
documents.delete("/documents/pages/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:delete"), (c)=>{
    const p = findPage(c);
    p.deletedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
documents.get("/documents/pages/:id/revisions", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, []));
// ---- files (multipart image upload → local disk + files catalog) ----
documents.post("/documents/files", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("file:upload"), async (c)=>{
    const user = c.get("user");
    const pid = pidOf(c);
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!(file instanceof File)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Missing 'file' part");
    if (!file.type.startsWith("image/")) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Only image uploads are supported");
    if (file.size > MAX_UPLOAD_BYTES) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("File too large (5 MB max)");
    const ext = IMAGE_EXT[file.type] ?? extFromName(file.name) ?? "";
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])();
    const fname = `${id}${ext}`;
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$uploads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPLOADS_DIR"], {
        recursive: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["writeFile"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$uploads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPLOADS_DIR"], fname), Buffer.from(await file.arrayBuffer()));
    const f = {
        id,
        projectId: pid,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${fname}`,
        uploadedBy: user,
        createdAt: new Date().toISOString(),
        deletedAt: null
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].files.push(f);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, f);
});
documents.get("/documents/files", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].files.filter((f)=>f.projectId === pidOf(c) && !f.deletedAt)));
// ---- search ----
documents.get("/documents/search", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("document:view"), (c)=>{
    const q = (c.req.query("q") ?? "").toLowerCase();
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].pages.filter((p)=>p.projectId === pidOf(c) && !p.deletedAt && p.title.toLowerCase().includes(q)).slice(0, 20);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, rows);
});
function findPage(c) {
    const id = c.req.param("id");
    const p = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].pages.find((x)=>x.id === id && x.projectId === pidOf(c) && !x.deletedAt);
    if (!p) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    return p;
}
}),
"[project]/packages/api/src/modules/meeting/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "meeting",
    ()=>meeting
]);
/** Meeting routes — meetings + action items. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/state-machines.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const meeting = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
meeting.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"]);
const pidOf = (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).projectId;
meeting.get("/meetings", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("meeting:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].meetings.filter((m)=>m.projectId === pidOf(c) && !m.deletedAt)));
meeting.post("/meetings", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("meeting:create"), async (c)=>{
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["meetingCreate"]);
    const m = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pidOf(c),
        title: input.title,
        type: input.type ?? null,
        scheduledAt: input.scheduledAt,
        duration: input.duration ?? null,
        location: input.location ?? null,
        agenda: null,
        notes: null,
        status: "scheduled",
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].meetings.push(m);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, m);
});
meeting.get("/meetings/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("meeting:view"), (c)=>{
    const m = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].meetings.find((x)=>x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
    if (!m) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, m);
});
meeting.patch("/meetings/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("meeting:update"), async (c)=>{
    const m = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].meetings.find((x)=>x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
    if (!m) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["meetingUpdate"]);
    if (input.status && input.status !== m.status) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canTransition"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MEETING_TRANSITIONS"], m.status, input.status)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("Invalid status transition");
    }
    Object.assign(m, input, {
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, m);
});
meeting.delete("/meetings/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("meeting:delete"), (c)=>{
    const m = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].meetings.find((x)=>x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
    if (!m) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    m.deletedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
meeting.post("/meetings/:id/action-items", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("meeting:update"), async (c)=>{
    const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        assigneeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional()
    }));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, body);
});
}),
"[project]/packages/api/src/modules/notification/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "notification",
    ()=>notification
]);
/** Notification routes — user-scoped (not tenant-scoped). */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/auth.ts [app-route] (ecmascript)");
;
;
;
;
;
const notification = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
notification.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"]);
notification.get("/", (c)=>{
    const user = c.get("user");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].notifications.filter((n)=>n.userId === user.id));
});
notification.patch("/:id/read", (c)=>{
    const n = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].notifications.find((x)=>x.id === c.req.param("id"));
    if (!n) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    n.readAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, n);
});
notification.patch("/read-all", (c)=>{
    const user = c.get("user");
    for (const n of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].notifications.filter((x)=>x.userId === user.id))n.readAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
notification.get("/preferences", (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {}));
notification.patch("/preferences", (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {}));
}),
"[project]/packages/api/src/modules/organization/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "organization",
    ()=>organization
]);
/** Organization routes — workspace + members + invitations. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const organization = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
organization.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"]);
// List orgs the user belongs to (soft-deleted orgs disappear)
organization.get("/", (c)=>{
    const user = c.get("user");
    const orgs = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.filter((m)=>m.userId === user.id && m.status === "active").map((m)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.find((o)=>o.id === m.organizationId && !o.deletedAt)).filter(Boolean);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, orgs);
});
organization.post("/", async (c)=>{
    const user = c.get("user");
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["organizationCreate"]);
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.some((o)=>o.slug === input.slug && !o.deletedAt)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Slug already taken");
    const org = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        name: input.name,
        slug: input.slug,
        type: "team",
        logo: null,
        description: input.description ?? null,
        timezone: "UTC",
        language: "en",
        website: input.website ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.push(org);
    // creator becomes Owner
    const ownerRole = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === "Owner" && r.scope === "workspace");
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        organizationId: org.id,
        userId: user.id,
        role: ownerRole,
        status: "active",
        joinedAt: new Date().toISOString(),
        user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, org);
});
organization.get("/:organizationId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, currentOrg(c)));
// Soft delete — the org and everything under it becomes unreachable (404).
organization.delete("/:organizationId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("organization:delete"), (c)=>{
    const org = currentOrg(c);
    org.deletedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
organization.patch("/:organizationId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("organization:update"), async (c)=>{
    const org = currentOrg(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["organizationUpdate"]);
    Object.assign(org, input, {
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, org);
});
// Members
organization.get("/:organizationId/members", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("member:view"), (c)=>{
    const members = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.filter((m)=>m.organizationId === currentOrg(c).id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, members);
});
// Change a member's workspace role.
organization.patch("/:organizationId/members/:memberId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("member:update"), async (c)=>{
    const org = currentOrg(c);
    const member = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.find((m)=>m.id === c.req.param("memberId") && m.organizationId === org.id);
    if (!member) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    if (org.type === "personal") throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Personal workspaces cannot change roles");
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memberUpdate"]);
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === input.roleName && r.scope === "workspace");
    if (!role) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])(`Unknown workspace role "${input.roleName}"`);
    // an org always keeps at least one active Owner
    if (member.role.name === "Owner" && role.name !== "Owner" && activeOwners(org.id).length <= 1) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Cannot demote the last owner of the workspace");
    member.role = role;
    member.updatedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, member);
});
organization.delete("/:organizationId/members/:memberId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("member:remove"), (c)=>{
    const org = currentOrg(c);
    const id = c.req.param("memberId");
    const member = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.find((m)=>m.id === id && m.organizationId === org.id);
    if (!member) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    if (org.type === "personal") throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Personal workspaces cannot remove members");
    if (member.role.name === "Owner" && activeOwners(org.id).length <= 1) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Cannot remove the last owner of the workspace");
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.filter((m)=>m.id !== id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
function activeOwners(orgId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.filter((m)=>m.organizationId === orgId && m.status === "active" && m.role.name === "Owner");
}
/* ---------------- Invitations (the membership flow) ----------------
 * Users self-register (→ personal workspace); joining an org happens by
 * invitation. Accept requires the invitee to already have an account. */ organization.post("/:organizationId/invitations", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("member:create"), async (c)=>{
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invitationInput"]);
    const org = currentOrg(c);
    if (org.type === "personal") throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Personal workspaces cannot invite members");
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === input.roleName && r.scope === "workspace") ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === "Member" && r.scope === "workspace");
    const email = input.email.toLowerCase();
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.some((m)=>m.organizationId === org.id && m.status === "active" && m.user.email.toLowerCase() === email)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Already a member");
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].invitations.some((i)=>i.organizationId === org.id && i.email.toLowerCase() === email && i.status === "pending")) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Invitation already pending");
    const invitation = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        organizationId: org.id,
        email: input.email,
        status: "pending",
        roleName: role.name,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: new Date().toISOString()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].invitations.push(invitation);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, invitation);
});
organization.get("/:organizationId/invitations", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("member:view"), (c)=>{
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuery"])(c.req.query(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginationQuery"]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginated"])(c, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginate"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].invitations.filter((i)=>i.organizationId === currentOrg(c).id), q));
});
// accept (materializes the member) / cancel — admin-driven; email delivery deferred
organization.patch("/:organizationId/invitations/:invitationId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("member:create"), async (c)=>{
    const org = currentOrg(c);
    const invitation = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].invitations.find((i)=>i.id === c.req.param("invitationId") && i.organizationId === org.id);
    if (!invitation) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    if (invitation.status !== "pending") throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])(`Invitation is already ${invitation.status}`);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invitationAction"]);
    if (input.action === "cancel") {
        invitation.status = "cancelled";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, invitation);
    }
    // accept: the invitee must have registered on their own (personal workspace)
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.find((u)=>u.email.toLowerCase() === invitation.email.toLowerCase());
    if (!user) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("User must register before accepting this invitation");
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.some((m)=>m.organizationId === org.id && m.userId === user.id)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Already a member");
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === invitation.roleName && r.scope === "workspace") ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === "Member" && r.scope === "workspace");
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        organizationId: org.id,
        userId: user.id,
        role,
        status: "active",
        joinedAt: new Date().toISOString(),
        user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    invitation.status = "accepted";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, invitation);
});
function currentOrg(c) {
    const t = c.get("tenant");
    const org = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.find((o)=>o.id === t?.organizationId);
    if (!org) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    return org;
}
}),
"[project]/packages/api/src/modules/planning/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "planning",
    ()=>planning
]);
/** Planning routes — iterations, milestones, timeline. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/state-machines.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const planning = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
planning.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"]);
const pidOf = (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).projectId;
// ---- iterations ----
planning.get("/planning/iterations", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("planning:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].iterations.filter((i)=>i.projectId === pidOf(c)).sort((a, b)=>a.startDate.localeCompare(b.startDate))));
planning.post("/planning/iterations", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("planning:manage"), async (c)=>{
    const pid = pidOf(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["iterationCreate"]);
    const it = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pid,
        name: input.name,
        goal: input.goal ?? null,
        startDate: input.startDate,
        endDate: input.endDate,
        status: "planned",
        committedPoints: 0,
        completedPoints: 0,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].iterations.push(it);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, it);
});
planning.patch("/planning/iterations/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("planning:manage"), async (c)=>{
    const it = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].iterations.find((i)=>i.id === c.req.param("id") && i.projectId === pidOf(c));
    if (!it) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["iterationUpdate"]);
    if (input.status && input.status !== it.status) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canTransition"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ITERATION_TRANSITIONS"], it.status, input.status)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])(`Cannot transition iteration from ${it.status} to ${input.status}`);
    }
    Object.assign(it, input, {
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, it);
});
// ---- milestones ----
planning.get("/planning/milestones", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("planning:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].milestones.filter((m)=>m.projectId === pidOf(c))));
planning.post("/planning/milestones", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("planning:manage"), async (c)=>{
    const pid = pidOf(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["milestoneCreate"]);
    const m = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pid,
        name: input.name,
        description: input.description ?? null,
        dueDate: input.dueDate ?? null,
        status: "planned",
        totalTasks: 0,
        doneTasks: 0,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].milestones.push(m);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, m);
});
planning.patch("/planning/milestones/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("planning:manage"), async (c)=>{
    const m = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].milestones.find((x)=>x.id === c.req.param("id") && x.projectId === pidOf(c));
    if (!m) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["milestoneUpdate"]);
    if (input.status && input.status !== m.status) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canTransition"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MILESTONE_TRANSITIONS"], m.status, input.status)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])(`Cannot transition milestone from ${m.status} to ${input.status}`);
    }
    Object.assign(m, input, {
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, m);
});
// ---- timeline (gantt) ----
planning.get("/planning/timeline", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("planning:view"), (c)=>{
    const pid = pidOf(c);
    const its = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].iterations.filter((i)=>i.projectId === pid);
    const ms = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].milestones.filter((m)=>m.projectId === pid);
    const starts = its.map((i)=>i.startDate).sort();
    const ends = its.map((i)=>i.endDate).sort();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        iterations: its,
        milestones: ms,
        window: {
            start: starts[0] ?? null,
            end: ends.at(-1) ?? null
        }
    });
});
}),
"[project]/packages/api/src/modules/project/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "project",
    ()=>project,
    "projectMembers",
    ()=>projectMembers
]);
/** Project routes — projects under an org, and project members. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/state-machines.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const project = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
// List projects for an org (member sees all)
project.get("/", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("project:view"), (c)=>{
    const orgId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).organizationId;
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.filter((p)=>p.organizationId === orgId && !p.deletedAt);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, rows);
});
project.post("/", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orgContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("project:create"), async (c)=>{
    const user = c.get("user");
    const orgId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).organizationId;
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectCreate"]);
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.some((p)=>p.organizationId === orgId && p.slug === input.slug)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Slug already taken in this organization");
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.some((p)=>p.organizationId === orgId && p.key === input.key)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Key already taken in this organization");
    // Personal workspaces are capped at PERSONAL_PROJECT_LIMIT active projects.
    // Active = not archived and not soft-deleted (archiving frees the slot).
    // See docs/foundation/04-plans-workspaces.md and ADR 0007.
    const org = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.find((o)=>o.id === orgId && !o.deletedAt);
    if (org?.type === "personal") {
        const active = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.filter((p)=>p.organizationId === orgId && !p.deletedAt && p.status !== "archived").length;
        if (active >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PERSONAL_PROJECT_LIMIT"]) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])(`Personal workspaces are limited to ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PERSONAL_PROJECT_LIMIT"]} active projects`);
    }
    const proj = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        organizationId: orgId,
        name: input.name,
        slug: input.slug,
        key: input.key,
        description: input.description ?? null,
        icon: input.icon ?? null,
        status: "active",
        visibility: "organization",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.push(proj);
    // default task config — created per project on first access (05-seed-data.md)
    for (const s of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TASK_STATUSES"]){
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: proj.id,
            name: s.name,
            color: null,
            order: s.order,
            isDefault: s.isDefault
        });
    }
    for (const name of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TASK_TYPES"]){
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
            projectId: proj.id,
            name
        });
    }
    // creator becomes a Project Admin
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === "Project Admin" && r.scope === "project");
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: proj.id,
        userId: user.id,
        role,
        status: "active",
        joinedAt: new Date().toISOString(),
        user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectSchema"].parse(proj));
});
const projectMembers = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
projectMembers.get("/members", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"], (c)=>{
    const projectId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).projectId;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.filter((m)=>m.projectId === projectId));
});
projectMembers.post("/members", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("project:manage-members"), async (c)=>{
    const proj = currentProject(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectMemberAdd"]);
    // only active org members can be invited — 404, never 403 (leak rule)
    const orgMember = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.find((m)=>m.organizationId === proj.organizationId && m.status === "active" && m.user.email.toLowerCase() === input.email.toLowerCase());
    if (!orgMember) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.some((m)=>m.projectId === proj.id && m.userId === orgMember.userId)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Already a member or invited");
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === (input.roleName ?? "Member") && r.scope === "project");
    if (!role) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])(`Unknown project role "${input.roleName ?? "Member"}"`);
    const row = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: proj.id,
        userId: orgMember.userId,
        role,
        status: "pending",
        joinedAt: null,
        user: orgMember.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.push(row);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, row);
});
projectMembers.patch("/members/:memberId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("project:manage-members"), async (c)=>{
    const proj = currentProject(c);
    const row = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.find((m)=>m.id === c.req.param("memberId") && m.projectId === proj.id);
    if (!row) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectMemberUpdate"]);
    if (input.roleName) {
        const role = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].roles.find((r)=>r.name === input.roleName && r.scope === "project");
        if (!role) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])(`Unknown project role "${input.roleName}"`);
        row.role = role;
    }
    if (input.status === "active") {
        if (row.status !== "pending") throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])("Only pending invitations can be accepted");
        row.status = "active";
        row.joinedAt = new Date().toISOString();
    }
    row.updatedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, row);
});
projectMembers.delete("/members/:memberId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("project:manage-members"), (c)=>{
    const proj = currentProject(c);
    const id = c.req.param("memberId");
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.some((m)=>m.id === id && m.projectId === proj.id)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectMembers.filter((m)=>m.id !== id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
// Project-scoped routes (by :projectId across the whole org)
project.get("/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"], (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, currentProject(c)));
project.patch("/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("project:update"), async (c)=>{
    const proj = currentProject(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectUpdate"]);
    if (input.status && input.status !== proj.status) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canTransition"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$state$2d$machines$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROJECT_TRANSITIONS"], proj.status, input.status)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])(`Cannot transition project from ${proj.status} to ${input.status}`);
    }
    Object.assign(proj, input, {
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, proj);
});
project.delete("/:projectId", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("project:delete"), (c)=>{
    const proj = currentProject(c);
    proj.deletedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
function currentProject(c) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c);
    const p = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.find((x)=>x.id === t.projectId && !x.deletedAt);
    if (!p) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    return p;
}
}),
"[project]/packages/api/src/modules/reporting/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reporting",
    ()=>reporting
]);
/** Reporting routes — dashboard aggregation, progress, activity, export. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const reporting = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
reporting.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"]);
const pidOf = (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c).projectId;
reporting.get("/reporting/dashboard", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("reporting:view"), (c)=>{
    const pid = pidOf(c);
    const project = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectSchema"].parse(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.find((p)=>p.id === pid));
    const topTasks = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.filter((t)=>t.projectId === pid && !t.parentId && !t.deletedAt);
    const byStatus = (name)=>{
        const s = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.find((x)=>x.projectId === pid && x.name === name);
        return topTasks.filter((t)=>s && t.statusId === s.id);
    };
    const iteration = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].iterations.find((i)=>i.projectId === pid && i.status === "active");
    const iterationTasks = iteration ? topTasks.filter((t)=>t.iterationId === iteration.id) : topTasks;
    const active = topTasks.filter((t)=>byStatus("Done").every((d)=>d.id !== t.id)).length;
    const overdue = topTasks.filter((t)=>t.dueDate && new Date(t.dueDate) < new Date() && byStatus("Done").every((d)=>d.id !== t.id)).length;
    const doneThisIteration = iterationTasks.filter((t)=>byStatus("Done").some((d)=>d.id === t.id)).length;
    // workload (demo capacity = 12)
    const workload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.map((u)=>{
        const assigned = topTasks.filter((t)=>t.assigneeId === u.id && byStatus("Done").every((d)=>d.id !== t.id)).length;
        const colors = [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f"
        ];
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].users.indexOf(u) % colors.length;
        return {
            userId: u.id,
            name: u.name,
            initials: u.name.split(" ").map((p)=>p[0]).join("").slice(0, 2).toUpperCase(),
            color: colors[idx],
            assigned,
            capacity: 12
        };
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        project,
        kpis: {
            active,
            inProgress: byStatus("In Progress").length,
            overdue,
            doneThisIteration,
            activeTrend: [
                55,
                50,
                53,
                61,
                58,
                63,
                60,
                63
            ],
            inProgressTrend: [
                13,
                14,
                16,
                15,
                19,
                17,
                20,
                21
            ],
            overdueTrend: [
                2,
                3,
                4,
                3,
                4,
                3,
                5,
                4
            ],
            doneTrend: [
                4,
                9,
                12,
                17,
                21,
                26,
                30,
                34
            ]
        },
        sprint: iteration ? {
            id: iteration.id,
            name: iteration.name,
            committedPoints: iteration.committedPoints,
            completedPoints: iteration.completedPoints,
            progress: iteration.progress,
            burndown: [
                {
                    day: 1,
                    remaining: 52
                },
                {
                    day: 2,
                    remaining: 50
                },
                {
                    day: 3,
                    remaining: 45
                },
                {
                    day: 4,
                    remaining: 47
                },
                {
                    day: 5,
                    remaining: 40
                },
                {
                    day: 6,
                    remaining: 41
                },
                {
                    day: 7,
                    remaining: 33
                },
                {
                    day: 8,
                    remaining: 34
                },
                {
                    day: 9,
                    remaining: 28
                },
                {
                    day: 10,
                    remaining: 27
                }
            ]
        } : null,
        activity: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].activity.filter((a)=>a.projectId === pid).sort((a, b)=>b.when.localeCompare(a.when)).slice(0, 8),
        workload
    });
});
reporting.get("/reporting/progress", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("reporting:view"), (c)=>{
    const pid = pidOf(c);
    const statuses = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.filter((s)=>s.projectId === pid).sort((a, b)=>a.order - b.order).map((s)=>({
            id: s.id,
            name: s.name,
            color: s.color,
            count: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.filter((t)=>t.projectId === pid && t.statusId === s.id && !t.deletedAt && !t.parentId).length
        }));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        statuses
    });
});
reporting.get("/reporting/activity", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("reporting:view"), (c)=>{
    const pid = pidOf(c);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].activity.filter((a)=>a.projectId === pid).sort((a, b)=>b.when.localeCompare(a.when)));
});
reporting.get("/reporting/export", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("reporting:export"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        format: c.req.query("format") ?? "csv",
        url: null
    }));
}),
"[project]/packages/api/src/modules/task/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "task",
    ()=>task
]);
/** Task routes — list (filtered), CRUD, statuses/labels/types. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/uuid.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/tenant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/permission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const task = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
task.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectContext"]);
const taskListQuery = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginationQuery"].extend({
    statusId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional(),
    assigneeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional(),
    labelId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional(),
    typeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional(),
    priority: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    iterationId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional(),
    q: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
function projectIdOf(c) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$tenant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentTenant"])(c);
    return t.projectId;
}
// ---- list ----
task.get("/tasks", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:view"), (c)=>{
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuery"])(c.req.query(), taskListQuery);
    const pid = projectIdOf(c);
    let rows = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.filter((t)=>t.projectId === pid && !t.deletedAt && !t.parentId);
    if (q.statusId) rows = rows.filter((t)=>t.statusId === q.statusId);
    if (q.assigneeId) rows = rows.filter((t)=>t.assigneeId === q.assigneeId);
    if (q.typeId) rows = rows.filter((t)=>t.typeId === q.typeId);
    if (q.priority) rows = rows.filter((t)=>t.priority === q.priority);
    if (q.iterationId) rows = rows.filter((t)=>t.iterationId === q.iterationId);
    if (q.labelId) rows = rows.filter((t)=>t.labels.some((l)=>l.id === q.labelId));
    if (q.q) {
        const s = q.q.toLowerCase();
        rows = rows.filter((t)=>t.title.toLowerCase().includes(s));
    }
    rows = rows.sort((a, b)=>a.order - b.order);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginated"])(c, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paginate"])(rows.map((r)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["taskSchema"].parse(r)), q));
});
task.post("/tasks", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:create"), async (c)=>{
    const pid = projectIdOf(c);
    const user = c.get("user");
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["taskCreate"]);
    const defaultStatus = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.find((s)=>s.projectId === pid && s.isDefault);
    const status = input.statusId ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.find((s)=>s.id === input.statusId && s.projectId === pid) : defaultStatus;
    if (input.statusId && !status) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])("Status not found");
    const labels = (input.labelIds ?? []).map((id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskLabels.find((l)=>l.id === id && l.projectId === pid)).filter(Boolean);
    const created_ = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pid,
        title: input.title,
        description: input.description ?? null,
        statusId: status?.id ?? defaultStatus.id,
        assigneeId: input.assigneeId ?? null,
        reporterId: user.id,
        priority: input.priority ?? "medium",
        typeId: input.typeId ?? null,
        parentId: input.parentId ?? null,
        iterationId: input.iterationId ?? null,
        milestoneId: input.milestoneId ?? null,
        dueDate: input.dueDate ?? null,
        order: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.filter((t)=>t.projectId === pid).length,
        labels,
        estimate: input.estimate ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.push(created_);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["taskSchema"].parse(created_));
});
// ---- statuses / labels / types (static sub-paths BEFORE :id) ----
task.get("/tasks/statuses", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.filter((s)=>s.projectId === projectIdOf(c)).sort((a, b)=>a.order - b.order)));
task.post("/tasks/statuses", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:update"), async (c)=>{
    const pid = projectIdOf(c);
    const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }));
    const s = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pid,
        name: body.name,
        color: body.color ?? null,
        order: 0,
        isDefault: false
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.push(s);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, s);
});
task.get("/tasks/labels", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskLabels.filter((l)=>l.projectId === projectIdOf(c))));
task.post("/tasks/labels", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:update"), async (c)=>{
    const pid = projectIdOf(c);
    const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }));
    const l = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pid,
        name: body.name,
        color: body.color ?? null
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskLabels.push(l);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, l);
});
task.get("/tasks/types", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:view"), (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes.filter((t)=>t.projectId === projectIdOf(c))));
task.post("/tasks/types", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:update"), async (c)=>{
    const pid = projectIdOf(c);
    const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    }));
    const t = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$uuid$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuidv7"])(),
        projectId: pid,
        name: body.name
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskTypes.push(t);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])(c, t);
});
task.get("/tasks/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:view"), (c)=>{
    const t = findTask(c);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, serializeTask(t));
});
task.patch("/tasks/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:update"), async (c)=>{
    const t = findTask(c);
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["taskUpdate"]);
    // optimistic concurrency
    if (input.updatedAt && input.updatedAt !== t.updatedAt) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("Task was modified");
    if (input.statusId) {
        const pid = projectIdOf(c);
        const ns = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskStatuses.find((s)=>s.id === input.statusId && s.projectId === pid);
        if (!ns) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])("Status not found");
    }
    if (input.labelIds) {
        const pid = projectIdOf(c);
        t.labels = input.labelIds.map((id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].taskLabels.find((l)=>l.id === id && l.projectId === pid)).filter(Boolean);
    }
    for (const k of [
        "title",
        "description",
        "statusId",
        "assigneeId",
        "priority",
        "typeId",
        "parentId",
        "iterationId",
        "milestoneId",
        "dueDate",
        "estimate"
    ]){
        if (input[k] !== undefined) t[k] = input[k];
    }
    t.updatedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, serializeTask(t));
});
task.delete("/tasks/:id", (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("task:delete"), (c)=>{
    const t = findTask(c);
    t.deletedAt = new Date().toISOString();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noContent"])(c);
});
/* ---- helpers ---- */ function findTask(c) {
    const pid = projectIdOf(c);
    const id = c.req.param("id");
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.find((x)=>x.id === id && x.projectId === pid && !x.deletedAt);
    if (!t) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    return t;
}
function serializeTask(t) {
    return {
        ...t,
        subtasks: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].tasks.filter((s)=>s.parentId === t.id && !s.deletedAt).sort((a, b)=>a.order - b.order),
        comments: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].comments.filter((cm)=>cm.taskId === t.id).sort((a, b)=>a.createdAt.localeCompare(b.createdAt))
    };
}
}),
"[project]/packages/api/src/modules/user/routes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "users",
    ()=>users
]);
/** User routes — profile writes + project recents (visit history).
 *  Reads of the profile live at GET /auth/me. Recents are identity-level
 *  (cross-org by nature), so these routes only require auth — no tenant
 *  middleware. Projects outside the caller's orgs stay invisible (404). */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/hono@4.12.32/node_modules/hono/dist/hono.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/db/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/responses.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/api/src/lib/auth.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
/** Server-side history cap per user; GET may return fewer via ?limit=. */ const HISTORY_CAP = 5;
/** Most-recently-visited projects of the user, embedded with their org. */ const recentProjects = (userId, limit)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectVisits.filter((v)=>v.userId === userId).sort((a, b)=>b.visitedAt.localeCompare(a.visitedAt)).slice(0, limit).map((v)=>{
        const project = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.find((p)=>p.id === v.projectId && !p.deletedAt);
        if (!project) return null; // deleted project → row goes silent
        const organization = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.find((o)=>o.id === project.organizationId && !o.deletedAt);
        if (!organization) return null;
        return {
            project,
            organization,
            visitedAt: v.visitedAt
        };
    }).filter((x)=>x !== null);
const users = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$hono$40$4$2e$12$2e$32$2f$node_modules$2f$hono$2f$dist$2f$hono$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hono"]();
users.use("*", __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"]);
users.patch("/me", async (c)=>{
    const user = c.get("user");
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userUpdate"]);
    Object.assign(user, input, {
        updatedAt: new Date().toISOString()
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, user);
});
users.get("/me/recents", (c)=>{
    const user = c.get("user");
    const raw = Number(c.req.query("limit") ?? 3);
    const limit = Math.min(Math.max(Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 3, 1), HISTORY_CAP);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, recentProjects(user.id, limit));
});
users.post("/me/recents", async (c)=>{
    const user = c.get("user");
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"])(await c.req.json(), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recentTouch"]);
    const project = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projects.find((p)=>p.id === input.projectId && !p.deletedAt);
    // 404 (not 403) when the project or its org is outside the caller's reach.
    const org = project ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].organizations.find((o)=>o.id === project.organizationId && !o.deletedAt) : undefined;
    const member = org && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].members.find((m)=>m.organizationId === org.id && m.userId === user.id && m.status === "active");
    if (!project || !org || !member) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notFound"])();
    const now = new Date().toISOString();
    const existing = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectVisits.find((v)=>v.userId === user.id && v.projectId === project.id);
    if (existing) {
        existing.visitedAt = now;
    } else {
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectVisits.push({
            userId: user.id,
            projectId: project.id,
            visitedAt: now
        });
    }
    // prune the history beyond the cap (oldest first)
    const mine = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectVisits.filter((v)=>v.userId === user.id).sort((a, b)=>b.visitedAt.localeCompare(a.visitedAt));
    for (const v of mine.slice(HISTORY_CAP)){
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectVisits.splice(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$db$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["store"].projectVisits.indexOf(v), 1);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$api$2f$src$2f$lib$2f$responses$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["data"])(c, {
        project,
        visitedAt: now
    });
});
}),
"[project]/packages/core/src/constants/permissions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Permission keys — seed the `permissions` table.
 *
 * Convention `<module>:<action>` per `docs/tech/02-conventions.md`.
 * Full list from `docs/tech/05-seed-data.md`.
 */ __turbopack_context__.s([
    "ALL_PERMISSIONS",
    ()=>ALL_PERMISSIONS,
    "PERMISSION_GROUPS",
    ()=>PERMISSION_GROUPS,
    "PERMISSION_KEYS",
    ()=>PERMISSION_KEYS
]);
const PERMISSION_KEYS = [
    // Organization
    "organization:view",
    "organization:update",
    "organization:delete",
    // Members
    "member:view",
    "member:create",
    "member:update",
    "member:remove",
    // Project
    "project:create",
    "project:view",
    "project:update",
    "project:archive",
    "project:delete",
    "project:manage-members",
    // Task
    "task:view",
    "task:create",
    "task:update",
    "task:delete",
    // Documents
    "document:view",
    "document:create",
    "document:update",
    "document:delete",
    "file:upload",
    // Planning
    "planning:view",
    "planning:manage",
    // Meeting
    "meeting:view",
    "meeting:create",
    "meeting:update",
    "meeting:delete",
    // Agreement
    "agreement:view",
    "agreement:create",
    "agreement:update",
    "agreement:delete",
    // Reporting
    "reporting:view",
    "reporting:export",
    // Client Portal
    "portal:manage",
    // Billing
    "billing:manage",
    // AI
    "ai:use"
];
const PERMISSION_GROUPS = {
    organization: [
        "organization:view",
        "organization:update",
        "organization:delete"
    ],
    member: [
        "member:view",
        "member:create",
        "member:update",
        "member:remove"
    ],
    project: [
        "project:create",
        "project:view",
        "project:update",
        "project:archive",
        "project:delete",
        "project:manage-members"
    ],
    task: [
        "task:view",
        "task:create",
        "task:update",
        "task:delete"
    ],
    document: [
        "document:view",
        "document:create",
        "document:update",
        "document:delete",
        "file:upload"
    ],
    planning: [
        "planning:view",
        "planning:manage"
    ],
    meeting: [
        "meeting:view",
        "meeting:create",
        "meeting:update",
        "meeting:delete"
    ],
    agreement: [
        "agreement:view",
        "agreement:create",
        "agreement:update",
        "agreement:delete"
    ],
    reporting: [
        "reporting:view",
        "reporting:export"
    ],
    portal: [
        "portal:manage"
    ],
    billing: [
        "billing:manage"
    ],
    ai: [
        "ai:use"
    ]
};
const ALL_PERMISSIONS = [
    ...PERMISSION_KEYS
];
}),
"[project]/packages/core/src/constants/plans.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Plans + default task config — seed the `plans` table and per-project defaults.
 * From `docs/tech/05-seed-data.md`.
 */ __turbopack_context__.s([
    "DEFAULT_TASK_STATUSES",
    ()=>DEFAULT_TASK_STATUSES,
    "DEFAULT_TASK_TYPES",
    ()=>DEFAULT_TASK_TYPES,
    "PERSONAL_PROJECT_LIMIT",
    ()=>PERSONAL_PROJECT_LIMIT,
    "PLAN_SEEDS",
    ()=>PLAN_SEEDS
]);
const PERSONAL_PROJECT_LIMIT = 2;
const PLAN_SEEDS = [
    {
        name: "free",
        price: "0",
        currency: "USD",
        projectLimit: PERSONAL_PROJECT_LIMIT,
        features: {
            core_modules: true
        }
    },
    {
        name: "professional",
        price: "49",
        currency: "USD",
        projectLimit: null,
        features: {
            core_modules: true,
            client_portal: true,
            advanced_reporting: true
        }
    },
    {
        name: "enterprise",
        price: "0",
        currency: "USD",
        projectLimit: null,
        features: {
            core_modules: true,
            client_portal: true,
            advanced_reporting: true,
            self_hosted: true,
            sso: true,
            audit_logs: true,
            advanced_permissions: true
        }
    }
];
const DEFAULT_TASK_STATUSES = [
    {
        name: "To Do",
        order: 0,
        isDefault: true
    },
    {
        name: "In Progress",
        order: 1,
        isDefault: false
    },
    {
        name: "Done",
        order: 2,
        isDefault: false
    }
];
const DEFAULT_TASK_TYPES = [
    "Task",
    "Bug",
    "Feature",
    "Epic"
];
}),
"[project]/packages/core/src/constants/roles.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SYSTEM_PROJECT_ROLES",
    ()=>SYSTEM_PROJECT_ROLES,
    "SYSTEM_WORKSPACE_ROLES",
    ()=>SYSTEM_WORKSPACE_ROLES
]);
/**
 * Default roles — system roles (`is_system = true`).
 *
 * Workspace roles:   scope `workspace`, organization_id null.
 * Project roles:     scope `project`, organization_id null.
 *
 * From `docs/tech/05-seed-data.md`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/permissions.ts [app-route] (ecmascript)");
;
const P = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PERMISSION_GROUPS"];
const VIEW_AND_EXPORT = [
    ...P.project.filter((k)=>k === "project:view"),
    ...P.task.filter((k)=>k.endsWith(":view")),
    ...P.document.filter((k)=>k.endsWith(":view")),
    ...P.planning.filter((k)=>k.endsWith(":view")),
    ...P.meeting.filter((k)=>k.endsWith(":view")),
    ...P.agreement.filter((k)=>k.endsWith(":view")),
    ...P.reporting
];
const SYSTEM_WORKSPACE_ROLES = [
    {
        name: "Owner",
        scope: "workspace",
        permissions: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ALL_PERMISSIONS"]
    },
    {
        name: "Admin",
        scope: "workspace",
        permissions: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ALL_PERMISSIONS"].filter((k)=>k !== "organization:delete")
    },
    {
        name: "Project Manager",
        scope: "workspace",
        permissions: [
            ...P.project,
            ...P.task,
            ...P.document,
            ...P.planning,
            ...P.meeting,
            ...P.agreement,
            ...P.reporting,
            ...P.portal
        ]
    },
    {
        name: "Member",
        scope: "workspace",
        permissions: [
            "project:view",
            ...P.task,
            ...P.document,
            "planning:view",
            "meeting:view",
            "reporting:view"
        ]
    },
    {
        name: "Viewer",
        scope: "workspace",
        permissions: VIEW_AND_EXPORT
    }
];
const SYSTEM_PROJECT_ROLES = [
    {
        name: "Project Admin",
        scope: "project",
        permissions: [
            "project:view",
            "project:update",
            "project:manage-members",
            ...P.task,
            ...P.document,
            ...P.planning,
            ...P.meeting,
            ...P.agreement,
            ...P.reporting
        ]
    },
    {
        name: "Project Manager",
        scope: "project",
        permissions: [
            "project:view",
            ...P.task,
            ...P.document,
            ...P.planning,
            ...P.meeting,
            ...P.reporting
        ]
    },
    {
        name: "Member",
        scope: "project",
        permissions: [
            "project:view",
            ...P.task,
            ...P.document,
            "planning:view",
            "meeting:view",
            "reporting:view"
        ]
    },
    {
        name: "Viewer",
        scope: "project",
        permissions: [
            "project:view",
            "task:view",
            "document:view",
            "planning:view",
            "meeting:view",
            "agreement:view",
            "reporting:view"
        ]
    }
];
}),
"[project]/packages/core/src/constants/state-machines.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * State machines — allowed transitions. Any other transition → 409 conflict.
 * From `docs/tech/03-data-model.md` → "State Machines".
 */ __turbopack_context__.s([
    "AGREEMENT_TRANSITIONS",
    ()=>AGREEMENT_TRANSITIONS,
    "CLIENT_USER_TRANSITIONS",
    ()=>CLIENT_USER_TRANSITIONS,
    "INVITATION_TRANSITIONS",
    ()=>INVITATION_TRANSITIONS,
    "ITERATION_TRANSITIONS",
    ()=>ITERATION_TRANSITIONS,
    "MEETING_TRANSITIONS",
    ()=>MEETING_TRANSITIONS,
    "MILESTONE_TRANSITIONS",
    ()=>MILESTONE_TRANSITIONS,
    "PROJECT_TRANSITIONS",
    ()=>PROJECT_TRANSITIONS,
    "SUBSCRIPTION_TRANSITIONS",
    ()=>SUBSCRIPTION_TRANSITIONS
]);
const INVITATION_TRANSITIONS = {
    pending: [
        "accepted",
        "expired",
        "cancelled"
    ],
    accepted: [],
    expired: [],
    cancelled: []
};
const PROJECT_TRANSITIONS = {
    active: [
        "on_hold",
        "archived"
    ],
    on_hold: [
        "active",
        "archived"
    ],
    archived: [
        "active"
    ]
};
const ITERATION_TRANSITIONS = {
    planned: [
        "active"
    ],
    active: [
        "completed"
    ],
    completed: []
};
const MILESTONE_TRANSITIONS = {
    planned: [
        "reached"
    ],
    reached: []
};
const MEETING_TRANSITIONS = {
    scheduled: [
        "completed",
        "cancelled"
    ],
    completed: [],
    cancelled: []
};
const AGREEMENT_TRANSITIONS = {
    draft: [
        "sent"
    ],
    sent: [
        "accepted",
        "rejected",
        "expired"
    ],
    accepted: [],
    rejected: [],
    expired: []
};
const CLIENT_USER_TRANSITIONS = {
    invited: [
        "active"
    ],
    active: [
        "disabled"
    ],
    disabled: [
        "active"
    ]
};
const SUBSCRIPTION_TRANSITIONS = {
    active: [
        "past_due"
    ],
    past_due: [
        "active",
        "canceled"
    ],
    canceled: []
};
}),
"[project]/packages/core/src/content.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "contentSchema",
    ()=>contentSchema
]);
/**
 * Rich-text content model — `pages.content` and `tasks.desc` store a single
 * ProseMirror document (Tiptap `JSONContent`) as jsonb.
 *
 * The editor writes native ProseMirror JSON; this package validates *shape*
 * (not a fixed node whitelist) so any extension's nodes/marks persist without
 * a core change here. `@pmin/core` deliberately has no Tiptap dependency —
 * the type below is hand-rolled to be structurally equal to
 * `@tiptap/core`'s `JSONContent`, and the web app casts between the two only
 * at the editor boundary.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const markSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    attrs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()).optional()
});
const contentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    attrs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()).optional(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].lazy(()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(contentSchema)).optional(),
    marks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(markSchema).optional(),
    text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
}).passthrough();
}),
"[project]/packages/core/src/enums.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgreementStatus",
    ()=>AgreementStatus,
    "AgreementType",
    ()=>AgreementType,
    "ClientShareResource",
    ()=>ClientShareResource,
    "ClientUserStatus",
    ()=>ClientUserStatus,
    "InvitationStatus",
    ()=>InvitationStatus,
    "InvoiceStatus",
    ()=>InvoiceStatus,
    "IterationStatus",
    ()=>IterationStatus,
    "MeetingStatus",
    ()=>MeetingStatus,
    "MeetingType",
    ()=>MeetingType,
    "MemberStatus",
    ()=>MemberStatus,
    "MilestoneStatus",
    ()=>MilestoneStatus,
    "NotificationChannel",
    ()=>NotificationChannel,
    "OrganizationType",
    ()=>OrganizationType,
    "PlanName",
    ()=>PlanName,
    "ProjectStatus",
    ()=>ProjectStatus,
    "ProjectVisibility",
    ()=>ProjectVisibility,
    "RoleScope",
    ()=>RoleScope,
    "SubscriptionStatus",
    ()=>SubscriptionStatus,
    "TaskPriority",
    ()=>TaskPriority,
    "agreementStatusEnum",
    ()=>agreementStatusEnum,
    "agreementTypeEnum",
    ()=>agreementTypeEnum,
    "clientShareResourceEnum",
    ()=>clientShareResourceEnum,
    "clientUserStatusEnum",
    ()=>clientUserStatusEnum,
    "invitationStatusEnum",
    ()=>invitationStatusEnum,
    "invoiceStatusEnum",
    ()=>invoiceStatusEnum,
    "iterationStatusEnum",
    ()=>iterationStatusEnum,
    "meetingStatusEnum",
    ()=>meetingStatusEnum,
    "meetingTypeEnum",
    ()=>meetingTypeEnum,
    "memberStatusEnum",
    ()=>memberStatusEnum,
    "milestoneStatusEnum",
    ()=>milestoneStatusEnum,
    "notificationChannelEnum",
    ()=>notificationChannelEnum,
    "organizationTypeEnum",
    ()=>organizationTypeEnum,
    "planNameEnum",
    ()=>planNameEnum,
    "projectStatusEnum",
    ()=>projectStatusEnum,
    "projectVisibilityEnum",
    ()=>projectVisibilityEnum,
    "roleScopeEnum",
    ()=>roleScopeEnum,
    "subscriptionStatusEnum",
    ()=>subscriptionStatusEnum,
    "taskPriorityEnum",
    ()=>taskPriorityEnum
]);
/**
 * Enum definitions — the single source of truth for all DB enums.
 *
 * TS string-literal unions (canonical types) paired with `pgEnum` so the
 * Drizzle schema mirrors `docs/tech/03-data-model.md` exactly.
 *
 * See `docs/tech/02-conventions.md`: DB enums are snake_case.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.39.3/node_modules/drizzle-orm/pg-core/columns/enum.js [app-route] (ecmascript)");
/* ---- zod-friendly enum objects (re-exported for schema validation) ---- */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const memberStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("member_status", [
    "pending",
    "active",
    "suspended"
]);
const invitationStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("invitation_status", [
    "pending",
    "accepted",
    "expired",
    "cancelled"
]);
const roleScopeEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("role_scope", [
    "workspace",
    "project"
]);
const organizationTypeEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("organization_type", [
    "personal",
    "team"
]);
const projectStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("project_status", [
    "active",
    "on_hold",
    "archived"
]);
const projectVisibilityEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("project_visibility", [
    "organization",
    "private"
]);
const taskPriorityEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("task_priority", [
    "low",
    "medium",
    "high",
    "urgent"
]);
const iterationStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("iteration_status", [
    "planned",
    "active",
    "completed"
]);
const milestoneStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("milestone_status", [
    "planned",
    "reached"
]);
const meetingTypeEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("meeting_type", [
    "standup",
    "review",
    "planning",
    "client",
    "other"
]);
const meetingStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("meeting_status", [
    "scheduled",
    "completed",
    "cancelled"
]);
const agreementTypeEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("agreement_type", [
    "sow",
    "nda",
    "contract",
    "proposal",
    "other"
]);
const agreementStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("agreement_status", [
    "draft",
    "sent",
    "accepted",
    "rejected",
    "expired"
]);
const clientUserStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("client_user_status", [
    "invited",
    "active",
    "disabled"
]);
const clientShareResourceEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("client_share_resource", [
    "tasks",
    "milestones",
    "reports",
    "documents"
]);
const notificationChannelEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("notification_channel", [
    "in_app",
    "email"
]);
const planNameEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("plan_name", [
    "free",
    "professional",
    "enterprise"
]);
const subscriptionStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("subscription_status", [
    "active",
    "past_due",
    "canceled"
]);
const invoiceStatusEnum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$39$2e$3$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgEnum"])("invoice_status", [
    "paid",
    "pending",
    "failed"
]);
;
const MemberStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "pending",
    "active",
    "suspended"
]);
const InvitationStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "pending",
    "accepted",
    "expired",
    "cancelled"
]);
const RoleScope = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "workspace",
    "project"
]);
const OrganizationType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "personal",
    "team"
]);
const ProjectStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "active",
    "on_hold",
    "archived"
]);
const ProjectVisibility = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "organization",
    "private"
]);
const TaskPriority = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "low",
    "medium",
    "high",
    "urgent"
]);
const IterationStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "planned",
    "active",
    "completed"
]);
const MilestoneStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "planned",
    "reached"
]);
const MeetingType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "standup",
    "review",
    "planning",
    "client",
    "other"
]);
const MeetingStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "scheduled",
    "completed",
    "cancelled"
]);
const AgreementType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "sow",
    "nda",
    "contract",
    "proposal",
    "other"
]);
const AgreementStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "draft",
    "sent",
    "accepted",
    "rejected",
    "expired"
]);
const ClientUserStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "invited",
    "active",
    "disabled"
]);
const ClientShareResource = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "tasks",
    "milestones",
    "reports",
    "documents"
]);
const NotificationChannel = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "in_app",
    "email"
]);
const PlanName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "free",
    "professional",
    "enterprise"
]);
const SubscriptionStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "active",
    "past_due",
    "canceled"
]);
const InvoiceStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "paid",
    "pending",
    "failed"
]);
}),
"[project]/packages/core/src/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * @pmin/core — shared domain logic + types.
 *
 * Single source of truth for: enums, DB schema (Drizzle), zod schemas,
 * rich-text content model, permissions/roles/plans constants, and state machines.
 *
 * See `docs/tech/00-tech.md`.
 */ __turbopack_context__.s([
    "VERSION",
    ()=>VERSION
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/enums.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/content.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$schemas$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$constants$2f$roles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/constants/roles.ts [app-route] (ecmascript)");
const VERSION = "0.1.0";
;
;
;
;
;
;
;
;
;
}),
"[project]/packages/core/src/schemas/common.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ERROR_STATUS",
    ()=>ERROR_STATUS,
    "canTransition",
    ()=>canTransition,
    "data",
    ()=>data,
    "errorCode",
    ()=>errorCode,
    "errorEnvelope",
    ()=>errorEnvelope,
    "paginate",
    ()=>paginate,
    "paginated",
    ()=>paginated,
    "paginationQuery",
    ()=>paginationQuery
]);
/**
 * Shared API contract helpers — the standard response shapes from
 * `docs/tech/04-api-contract.md`.
 *
 *   Single resource : { data }
 *   List (paginated): { items, nextCursor, hasMore }
 *   Error           : { error: { code, message, details } }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const paginationQuery = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().min(1).max(100).default(25),
    cursor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
function paginated(item) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(item),
        nextCursor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
        hasMore: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean()
    });
}
function paginate(rows, opts) {
    const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
    let start = 0;
    if (opts.cursor) {
        const idx = rows.findIndex((r)=>encodeCursor(r.createdAt, r.id) === opts.cursor);
        start = idx === -1 ? 0 : idx + 1;
    }
    const slice = rows.slice(start, start + limit);
    const hasMore = start + limit < rows.length;
    const last = slice[slice.length - 1];
    return {
        items: slice,
        nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
        hasMore
    };
}
function encodeCursor(createdAt, id) {
    return encodeURIComponent(JSON.stringify({
        t: createdAt,
        i: id
    }));
}
function data(item) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        data: item
    });
}
const errorCode = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "validation_error",
    "unauthorized",
    "forbidden",
    "not_found",
    "conflict",
    "unprocessable",
    "rate_limited",
    "internal_error",
    "service_unavailable"
]);
const errorEnvelope = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    error: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        code: errorCode,
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        details: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()).optional()
    })
});
const ERROR_STATUS = {
    validation_error: 400,
    unauthorized: 401,
    forbidden: 403,
    not_found: 404,
    conflict: 409,
    unprocessable: 422,
    rate_limited: 429,
    internal_error: 500,
    service_unavailable: 503
};
function canTransition(transitions, from, to) {
    return transitions[from]?.includes(to) ?? false;
}
}),
"[project]/packages/core/src/schemas/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agreementCreate",
    ()=>agreementCreate,
    "agreementSchema",
    ()=>agreementSchema,
    "agreementUpdate",
    ()=>agreementUpdate,
    "dashboardSchema",
    ()=>dashboardSchema,
    "fileSchema",
    ()=>fileSchema,
    "forgotPasswordInput",
    ()=>forgotPasswordInput,
    "invitationAction",
    ()=>invitationAction,
    "invitationInput",
    ()=>invitationInput,
    "invitationSchema",
    ()=>invitationSchema,
    "iterationCreate",
    ()=>iterationCreate,
    "iterationSchema",
    ()=>iterationSchema,
    "iterationUpdate",
    ()=>iterationUpdate,
    "loginInput",
    ()=>loginInput,
    "meetingCreate",
    ()=>meetingCreate,
    "meetingSchema",
    ()=>meetingSchema,
    "meetingUpdate",
    ()=>meetingUpdate,
    "memberSchema",
    ()=>memberSchema,
    "memberUpdate",
    ()=>memberUpdate,
    "milestoneCreate",
    ()=>milestoneCreate,
    "milestoneSchema",
    ()=>milestoneSchema,
    "milestoneUpdate",
    ()=>milestoneUpdate,
    "notificationSchema",
    ()=>notificationSchema,
    "organizationCreate",
    ()=>organizationCreate,
    "organizationSchema",
    ()=>organizationSchema,
    "organizationUpdate",
    ()=>organizationUpdate,
    "pageCreate",
    ()=>pageCreate,
    "pageSchema",
    ()=>pageSchema,
    "pageUpdate",
    ()=>pageUpdate,
    "projectCreate",
    ()=>projectCreate,
    "projectMemberAdd",
    ()=>projectMemberAdd,
    "projectMemberSchema",
    ()=>projectMemberSchema,
    "projectMemberUpdate",
    ()=>projectMemberUpdate,
    "projectSchema",
    ()=>projectSchema,
    "projectUpdate",
    ()=>projectUpdate,
    "recentTouch",
    ()=>recentTouch,
    "registerInput",
    ()=>registerInput,
    "resetPasswordInput",
    ()=>resetPasswordInput,
    "roleSchema",
    ()=>roleSchema,
    "spaceCreate",
    ()=>spaceCreate,
    "spaceSchema",
    ()=>spaceSchema,
    "taskCreate",
    ()=>taskCreate,
    "taskLabelSchema",
    ()=>taskLabelSchema,
    "taskSchema",
    ()=>taskSchema,
    "taskStatusSchema",
    ()=>taskStatusSchema,
    "taskTypeSchema",
    ()=>taskTypeSchema,
    "taskUpdate",
    ()=>taskUpdate,
    "userSchema",
    ()=>userSchema,
    "userUpdate",
    ()=>userUpdate
]);
/**
 * Domain zod schemas — the single source of truth for request/response shapes.
 * The API validates bodies against these; the web app reuses them client-side.
 *
 * Field types follow `docs/tech/03-data-model.md`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/enums.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/content.ts [app-route] (ecmascript)");
;
;
;
const iso = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string();
const id = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid();
const userSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    image: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    emailVerified: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    createdAt: iso,
    updatedAt: iso
});
const registerInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email().max(255),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8).max(100)
});
const loginInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const forgotPasswordInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email()
});
const resetPasswordInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    token: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(20),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8).max(100)
});
const userUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100).optional(),
    image: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable().optional()
});
const organizationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OrganizationType"],
    logo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    timezone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    language: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    website: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    createdAt: iso,
    updatedAt: iso
});
const organizationCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(60).regex(/^[a-z0-9-]+$/),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    website: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().optional()
});
const organizationUpdate = organizationCreate.partial();
const roleSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    organizationId: id.nullable(),
    scope: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RoleScope"],
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    isSystem: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    permissions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string())
});
const memberUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    roleName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const memberSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    organizationId: id,
    userId: id,
    role: roleSchema,
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MemberStatus"],
    joinedAt: iso.nullable(),
    user: userSchema,
    createdAt: iso,
    updatedAt: iso
});
const invitationInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    roleName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const invitationAction = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    action: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "accept",
        "cancel"
    ])
});
const invitationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    organizationId: id,
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InvitationStatus"],
    roleName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    expiresAt: iso,
    createdAt: iso
});
const projectMemberSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    userId: id,
    role: roleSchema,
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MemberStatus"],
    joinedAt: iso.nullable(),
    user: userSchema,
    createdAt: iso,
    updatedAt: iso
});
const projectMemberAdd = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    roleName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const projectMemberUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    roleName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).optional(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("active").optional()
});
const recentTouch = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    projectId: id
});
const projectSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    organizationId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProjectStatus"],
    visibility: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProjectVisibility"],
    createdAt: iso,
    updatedAt: iso
});
const projectCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(120),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(60).regex(/^[a-z0-9-]+$/),
    key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2).max(10).regex(/^[A-Z0-9]+$/),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional()
});
const projectUpdate = projectCreate.partial().extend({
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProjectStatus"].optional(),
    visibility: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProjectVisibility"].optional()
});
const taskStatusSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
    isDefault: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean()
});
const taskLabelSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable()
});
const taskTypeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const taskSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    statusId: id,
    assigneeId: id.nullable(),
    reporterId: id.nullable(),
    priority: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TaskPriority"],
    typeId: id.nullable(),
    parentId: id.nullable(),
    iterationId: id.nullable(),
    milestoneId: id.nullable(),
    dueDate: iso.nullable(),
    order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
    labels: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(taskLabelSchema).default([]),
    estimate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nullable(),
    createdAt: iso,
    updatedAt: iso
});
const taskCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    statusId: id.optional(),
    priority: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TaskPriority"].optional(),
    assigneeId: id.nullable().optional(),
    typeId: id.nullable().optional(),
    parentId: id.nullable().optional(),
    iterationId: id.nullable().optional(),
    milestoneId: id.nullable().optional(),
    dueDate: iso.nullable().optional(),
    labelIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(id).optional(),
    estimate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative().nullable().optional()
});
const taskUpdate = taskCreate.partial().extend({
    updatedAt: iso.optional()
});
const spaceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()
});
const pageSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    spaceId: id,
    parentId: id.nullable(),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["contentSchema"],
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
    createdAt: iso,
    updatedAt: iso,
    editedBy: userSchema.nullable()
});
const spaceCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(120),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional()
});
const pageCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    spaceId: id,
    parentId: id.nullable().optional(),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional()
});
const pageUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    spaceId: id.optional(),
    parentId: id.nullable().optional(),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255).optional(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["contentSchema"].optional(),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional(),
    updatedAt: iso.optional()
});
const fileSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    size: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    url: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    uploadedBy: userSchema.nullable(),
    createdAt: iso
});
const iterationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    goal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    startDate: iso,
    endDate: iso,
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IterationStatus"],
    progress: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    committedPoints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
    completedPoints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
    createdAt: iso,
    updatedAt: iso
});
const iterationCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(120),
    goal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    startDate: iso,
    endDate: iso
});
const iterationUpdate = iterationCreate.partial().extend({
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IterationStatus"].optional()
});
const milestoneSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    dueDate: iso.nullable(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MilestoneStatus"],
    progress: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    totalTasks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
    doneTasks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
    createdAt: iso,
    updatedAt: iso
});
const milestoneCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(120),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    dueDate: iso.nullable().optional()
});
const milestoneUpdate = milestoneCreate.partial().extend({
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MilestoneStatus"].optional()
});
const meetingSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MeetingType"].nullable(),
    scheduledAt: iso,
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nullable(),
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    agenda: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown().nullable(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown().nullable(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MeetingStatus"],
    participants: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userSchema).default([]),
    createdAt: iso,
    updatedAt: iso
});
const meetingCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(200),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MeetingType"].optional(),
    scheduledAt: iso,
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().optional(),
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    participantIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(id).optional()
});
const meetingUpdate = meetingCreate.partial().extend({
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MeetingStatus"].optional()
});
const agreementSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    projectId: id,
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AgreementType"].nullable(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AgreementStatus"],
    counterparty: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    currency: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    startDate: iso.nullable(),
    endDate: iso.nullable(),
    signedAt: iso.nullable(),
    createdAt: iso,
    updatedAt: iso
});
const agreementCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(200),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AgreementType"].optional(),
    counterparty: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(200),
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nonnegative().optional(),
    currency: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().length(3).optional(),
    startDate: iso.optional(),
    endDate: iso.optional()
});
const agreementUpdate = agreementCreate.partial().extend({
    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$enums$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AgreementStatus"].optional()
});
const notificationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id,
    userId: id,
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    body: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    link: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    readAt: iso.nullable(),
    createdAt: iso
});
const dashboardSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    project: projectSchema,
    kpis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        active: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        inProgress: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        overdue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        doneThisIteration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        activeTrend: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()),
        inProgressTrend: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()),
        overdueTrend: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()),
        doneTrend: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number())
    }),
    sprint: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: id.nullable(),
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
        committedPoints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        completedPoints: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        progress: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        burndown: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            day: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            remaining: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
        }))
    }).nullable(),
    activity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: id,
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "move",
            "doc",
            "com",
            "done",
            "mile"
        ]),
        projectId: id.optional(),
        actorId: id,
        target: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        when: iso,
        whenLabel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })),
    workload: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        userId: id,
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        initials: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        assigned: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        capacity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()
    }))
});
}),
"[project]/packages/core/src/uuid.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * UUID v7 generation — time-sortable, index-friendly primary keys.
 *
 * Per `docs/tech/02-conventions.md`: PKs are UUID v7, app-generated.
 * Falls back to crypto.randomUUID (v4) if crypto.subtle/randomFill is unavailable.
 */ /** Generate a UUID v7 string (lowercase, dashed). */ __turbopack_context__.s([
    "uuidv7",
    ()=>uuidv7
]);
function uuidv7() {
    // RFC 9562 §5.3 — 48-bit unix-ms timestamp + 12 random + 62 random
    const unixts = Date.now();
    const ms = 2 ** 48 - 1;
    const tHi = Math.floor(unixts / 2 ** 16) & ms;
    // rand_hi: 12 bits (version nibble = 0x7) ; rand_lo: 62 bits (variant 0b10)
    const rand = new Uint8Array(10);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(rand);
    } else {
        for(let i = 0; i < 10; i++)rand[i] = Math.floor(Math.random() * 256);
    }
    const bytes = new Uint8Array(16);
    // timestamp (48 bits, big-endian)
    bytes[0] = tHi >>> 24 & 0xff;
    bytes[1] = tHi >>> 16 & 0xff;
    bytes[2] = tHi >>> 8 & 0xff;
    bytes[3] = tHi & 0xff;
    bytes[4] = unixts & 0xff ? unixts & 0xff : 0;
    // version + 12 bits random
    bytes[5] = rand[0] & 0x0f | 0x70;
    bytes[6] = rand[1];
    // variant + 62 bits random
    bytes[7] = rand[2] & 0x3f | 0x80;
    bytes.set(rand.subarray(3), 8);
    const h = (i)=>bytes[i].toString(16).padStart(2, "0");
    return `${h(0)}${h(1)}${h(2)}${h(3)}-` + `${h(4)}${h(5)}-` + `${h(6)}${h(7)}-` + `${h(8)}${h(9)}-` + `${h(10)}${h(11)}${h(12)}${h(13)}${h(14)}${h(15)}`;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__110kpwb._.js.map