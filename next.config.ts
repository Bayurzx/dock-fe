import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    unoptimized: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

};

export default nextConfig;
