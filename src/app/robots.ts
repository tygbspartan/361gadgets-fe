import type { MetadataRoute } from "next";
import { SITE_URL as SITE } from "@/lib/seo/jsonld";

// Private surfaces crawlers never need to fetch. Their pages are also marked
// noindex, in case a link elsewhere gets one listed anyway.
//
// Deliberately NOT blocked, because they carry "noindex, follow" and a blocked
// page's noindex can't be read: /products (the filter UI; its links lead to
// every product) and the sign-in forms.
const DISALLOW = [
  "/admin",
  "/account",
  "/checkout",
  "/cart",
  "/wishlist",
  "/profile",
  "/order-confirmation",
  "/auth",
];

// Explicitly welcomed search + AI crawlers.
const CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: CRAWLERS, allow: "/", disallow: DISALLOW },
      { userAgent: "*", allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
