import type { NextConfig } from "next";

// Determine build output type
const isStandalone = process.env.BUILD_TARGET === undefined || process.env.BUILD_TARGET === "standalone";

// Conditional logging (only in standalone)
const logging = isStandalone
  ? {
      fetches: {
        fullUrl: true,
        hmrRefreshes: true,
      },
    }
  : undefined;

// Conditional headers (only in standalone)
const headers = isStandalone
  ? async () => {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "Referrer-Policy",
              value: "origin-when-cross-origin",
            },
            {
              key: "X-XSS-Protection",
              value: "1; mode=block",
            },
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains",
            },
          ],
        },
      ];
    }
  : undefined;

// Next.js configuration
const nextConfig: NextConfig = {
  output: isStandalone ? "standalone" : "export",

  images: {
    unoptimized: !isStandalone, // Required for static export
  },

  // Add trailing slash for static exports (better compatibility with static hosting)
  trailingSlash: !isStandalone,

  // Conditionally add logging
  ...(logging && { logging }),

  // Conditionally add headers
  ...(headers && { headers }),

  experimental: {
    // Add experimental features here as needed
  },
};

export default nextConfig;