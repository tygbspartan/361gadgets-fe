import type { Metadata } from "next";

// /products is the human-facing filter UI, not an indexable surface — the
// canonical, indexable category/brand pages live at /category/[slug] and
// /brand/[slug]. Keep it crawlable-through (follow) but out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
