import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/b5cle1jv/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Next 16 dropped `next lint`, so the old `eslint: { ignoreDuringBuilds }`
  // key no longer exists on NextConfig — linting is a separate `eslint` run.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

