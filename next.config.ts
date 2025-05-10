import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // ...
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
    ],
  },
};

export default nextConfig;
