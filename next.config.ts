import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Skip type‐checking errors on production builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint errors on production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optional: suppress “exported runtime” warnings
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
