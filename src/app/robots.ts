import type { MetadataRoute } from "next";

const SITE = "https://www.361gadgets.com";

// Private / functional surfaces kept out of search (and AI) crawling.
const DISALLOW = [
  "/admin",
  "/account",
  "/checkout",
  "/cart",
  "/wishlist",
  "/products", // the filter UI — category/brand pages are the indexable surfaces
  "/profile",
  "/order-confirmation",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
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
    host: SITE,
  };
}
