import type { Metadata } from "next";
import { SITE_NAME } from "./jsonld";

/*
 * Page metadata helpers. Every page gets its own <title> (the root layout adds
 * " | 361 Gadgets"); public pages also get a description, a canonical URL and
 * share-card tags. Private pages (account, checkout, admin, sign-in forms)
 * are noindex: robots.txt keeps crawlers out of most of them, but a blocked URL
 * can still be listed if other sites link to it, and noindex prevents that.
 */

/** Account, checkout, order and admin pages: never in search results. */
export const PRIVATE_ROBOTS = { index: false, follow: false } as const;
/** Sign-in forms: not in results, but their links (home, register) may be followed. */
export const FORM_ROBOTS = { index: false, follow: true } as const;

export function privatePage(title: string, robots: Metadata["robots"] = PRIVATE_ROBOTS): Metadata {
  return { title, robots };
}

/* The generated default share card (app/opengraph-image.tsx). Named
   explicitly because a page that sets its own openGraph replaces the
   inherited one, image included. */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "361 Gadgets: genuine tech and gadgets in Nepal",
};

export function publicPage(opts: {
  title: string;
  description: string;
  path: string;
  /** Use the title exactly as given (no " | 361 Gadgets" suffix added). */
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = opts.absoluteTitle ? opts.title : `${opts.title} | ${SITE_NAME}`;
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: fullTitle,
      description: opts.description,
      url: opts.path,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: opts.description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
