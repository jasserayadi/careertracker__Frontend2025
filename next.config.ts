import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.material-tailwind.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
};

console.log("Next.js Config Loaded:", JSON.stringify(nextConfig, null, 2));

export default nextConfig;