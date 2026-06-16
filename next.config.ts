import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/crm',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
