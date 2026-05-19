import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js Edge & WebGL Compiler Optimizations
  productionBrowserSourceMaps: false, // Massively cuts production bundle size on edge network
  compress: true,                     // Enforces Brotli/Gzip compression for massive 3D .glb assets
  poweredByHeader: false,
  reactStrictMode: false,             // Prevents WebGL matrix context crashing during double-hydration mounts

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
