import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the project root to this folder so module/CSS resolution (e.g. the
  // `@import "tailwindcss"` in globals.css) anchors here even when dev/build is
  // launched from a parent dir like E:\mine. Without this, Next can infer the
  // wrong workspace root and fail to resolve packages from node_modules.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
      },
      {
        protocol: "http",
        hostname: "i.imgur.com",
      },
      {
        protocol: "http",
        hostname: "imgur.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
