import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/server/catalog";

/*
 * Called by the backend right after products, categories or brands change, so
 * category, brand and product pages and the sitemap show the change now rather
 * than within the hour.
 *
 * In production nginx sends /api/* to the backend, so this route is not
 * reachable from the internet at all; the backend calls the Next server
 * directly (STOREFRONT_REVALIDATE_URL, e.g. http://127.0.0.1:3001/api/revalidate).
 * It also needs the shared REVALIDATE_SECRET.
 */
export const dynamic = "force-dynamic";

function secretMatches(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  // Not configured: behave as if the route doesn't exist.
  if (!secret) return new Response(null, { status: 404 });
  if (!secretMatches(req.headers.get("x-revalidate-secret"), secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  // expire: 0 = drop now; the next visit refetches from the API.
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return Response.json({ ok: true, tag: CATALOG_TAG });
}
