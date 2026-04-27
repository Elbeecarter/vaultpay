import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@cloak.dev/sdk"],
  turbopack: {},
};

export default nextConfig;