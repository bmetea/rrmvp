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
        hostname: "whimsical-leader-0be11697b0.media.strapiapp.com",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
    ],
  },
};

export default nextConfig;
