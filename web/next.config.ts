import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "singlepage.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
