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
  async redirects() {
    return [
      {
        source: '/community',
        destination: 'https://community.tauqeermustafa.tech',
        permanent: true,
      },
      {
        source: '/community/:path*',
        destination: 'https://community.tauqeermustafa.tech/:path*',
        permanent: true,
      },
      {
        source: '/client',
        destination: 'https://portals.tauqeermustafa.tech',
        permanent: true,
      },
      {
        source: '/client/:path*',
        destination: 'https://portals.tauqeermustafa.tech/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
