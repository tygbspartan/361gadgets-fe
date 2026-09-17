import { headers } from "next/headers";

/**
 * Absolute API base URL for Server Components / generateMetadata / sitemap.
 * Resolution order:
 *  1. SERVER_API_URL — an absolute URL used for build-time work (SSG,
 *     generateStaticParams, sitemap) where there is no incoming request.
 *  2. NEXT_PUBLIC_API_URL when it is already absolute (dev: http://localhost:5000/api).
 *  3. Otherwise (merged prod, where it is the relative "/api") build an absolute
 *     URL from the incoming request host.
 */
export async function serverApiBase(): Promise<string> {
  if (process.env.SERVER_API_URL) return process.env.SERVER_API_URL;

  const env = process.env.NEXT_PUBLIC_API_URL || "/api";
  if (/^https?:\/\//.test(env)) return env;

  const h = await headers();
  const host = h.get("host") ?? `localhost:${process.env.PORT ?? 3000}`;
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}${env}`;
}
