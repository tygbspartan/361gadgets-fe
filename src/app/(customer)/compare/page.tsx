import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_NAME } from "@/lib/seo/jsonld";
import CompareView from "@/components/compare/CompareView";
import CompareSkeleton from "@/components/compare/CompareSkeleton";

// A personal, ever-changing view (?ids=…): useful to shoppers, nothing to index.
export const metadata: Metadata = {
  title: "Compare Products",
  description: `Compare up to 3 gadgets side by side at ${SITE_NAME}: price, rating, stock and every specification.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareSkeleton />}>
      <CompareView />
    </Suspense>
  );
}
