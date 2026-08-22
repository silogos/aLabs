import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // workspace packages ship raw TS/TSX source — compile them here
  transpilePackages: ["@pmin/core", "@pmin/editor", "@pmin/api"],
  output: "standalone",
};

export default nextConfig;
