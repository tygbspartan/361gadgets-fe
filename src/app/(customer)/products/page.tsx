import type { Metadata } from "next";
import { publicPage } from "@/lib/seo/metadata";
import ProductListing from "./ProductListing";

type SP = Record<string, string | string[] | undefined>;

const BASE = publicPage({
  title: "All Gadgets & Accessories in Nepal",
  description:
    "Browse every genuine gadget at 361 Gadgets Nepal: earbuds, speakers, smart watches, power banks, chargers, gaming gear and more. Cash on delivery across Nepal.",
  path: "/products",
});

/*
 * The plain /products page is indexable (it's the store's "all products"
 * page). Filtered, sorted or searched views (?category=…, ?sortBy=…) are not:
 * they stay out of the index but crawlable, and point to /products as canonical.
 * The listing itself is the client-side filter UI in ProductListing.
 */
export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.values(sp).some((v) => v !== undefined && v !== "");
  return filtered ? { ...BASE, robots: { index: false, follow: true } } : BASE;
}

export default function ProductsPage() {
  return <ProductListing />;
}
