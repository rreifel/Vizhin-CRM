import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/crm',
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
