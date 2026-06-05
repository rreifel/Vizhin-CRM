import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/crm',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
