import type { NextConfig } from "next";
import path from "path";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

/**
 * next/image refuses to optimise any host not listed in remotePatterns,
 * answering with a 400 and '"url" parameter is not allowed'. In production the
 * product images are served from the API origin (the backend writes them under
 * PUBLIC_BASE_URL, e.g. https://api.example.com/uploads/...), so that origin has
 * to be allowed here or every product image 400s.
 *
 * It is derived from the env the app already uses rather than hardcoded: a
 * literal domain means each environment needs its own config edit, and getting
 * it wrong fails only in production. NEXT_PUBLIC_ASSET_URL is the override for
 * when assets live on a different origin from the API; otherwise the API origin
 * is used, with the path left open because uploads sit outside the /api prefix.
 */
function assetOriginPattern(): RemotePattern[] {
  const raw =
    process.env.NEXT_PUBLIC_ASSET_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return [];

  let origin: URL;
  try {
    origin = new URL(raw);
  } catch {
    console.warn(
      "[next.config] Could not parse an asset origin from NEXT_PUBLIC_ASSET_URL / " +
        "NEXT_PUBLIC_API_URL — images served from the API host will not load.",
    );
    return [];
  }

  return [
    {
      protocol: origin.protocol.replace(":", "") as "http" | "https",
      hostname: origin.hostname,
      ...(origin.port ? { port: origin.port } : {}),
      pathname: "/**",
    },
  ];
}

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
      // The API / asset origin — see assetOriginPattern above.
      ...assetOriginPattern(),
    ],
  },
};

export default nextConfig;
