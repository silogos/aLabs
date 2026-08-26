import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // workspace packages ship raw TS/TSX source — compile them here
  transpilePackages: ["@pmin/core", "@pmin/editor", "@pmin/api"],
  // DB stack stays external on the server (resolved by Node at runtime —
  // Turbopack can't resolve pnpm-linked drizzle-orm from packages/api)
  serverExternalPackages: ["drizzle-orm", "postgres"],
  output: "standalone",
};

export default nextConfig;
