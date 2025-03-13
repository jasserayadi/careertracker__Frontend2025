import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.material-tailwind.com",
      },
    ],
  },
};

console.log("Next.js Config Loaded:", JSON.stringify(nextConfig, null, 2));

export default nextConfig;
