import Link from "next/link";
import type { Product } from "@/types/product.types";
import ProductGridCard from "@/components/products/ProductGridCard";
import { ROUTES } from "@/constants/routes";
import CollectionFilterLayout, { type BrandOption } from "./CollectionFilterLayout";

export default function CollectionView({
  title,
  intro,
  products,
  page,
  totalPages,
  hrefForPage,
  brands,
  showBrandFilter = true,
}: {
  title: string;
  intro?: string | null;
  products: Product[];
  page: number;
  totalPages: number;
  hrefForPage: (n: number) => string;
  brands: BrandOption[];
  showBrandFilter?: boolean;
}) {
  // Compact page window: 1 … p-1 p p+1 … last
  const pages: (number | "…")[] = [];
  if (totalPages > 1) {
    const push = (n: number) => pages.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) push(i);
    } else {
      push(1);
      if (page > 3) pages.push("…");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i);
      if (page < totalPages - 2) pages.push("…");
      push(totalPages);
    }
  }

  return (
    <div className="page-wrapper space-y-6">
      <CollectionFilterLayout
        title={title}
        brands={brands}
        showBrandFilter={showBrandFilter}
      >
        {/* SEO intro copy (rendered only when present) */}
        {intro && intro.trim() && (
          <div className="mb-6 max-w-4xl font-inter text-[14px] lg:text-base leading-6 text-[#4B4B4B] whitespace-pre-line">
            {intro}
          </div>
        )}

        {/* Grid */}
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 text-lg mb-1">No products found</p>
            <Link href={ROUTES.PRODUCTS} className="text-primary hover:underline text-sm">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination — real <a> links so crawlers follow them */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex justify-end">
            <div className="flex items-center gap-2 flex-wrap">
              {page > 1 && (
                <Link href={hrefForPage(page - 1)} rel="prev" className="px-3 py-2 border border-[#E9E9E9] rounded-sm text-[14px] text-[#313131] hover:border-primary hover:text-primary">
                  Back
                </Link>
              )}
              {pages.map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-1 text-[14px] text-[#313131]">…</span>
                ) : (
                  <Link
                    key={p}
                    href={hrefForPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`px-3 py-2 border rounded-sm text-[14px] ${
                      p === page
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "border-[#E9E9E9] text-[#313131] hover:border-primary hover:text-primary"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
              {page < totalPages && (
                <Link href={hrefForPage(page + 1)} rel="next" className="px-3 py-2 border border-[#E9E9E9] rounded-sm text-[14px] text-[#313131] hover:border-primary hover:text-primary">
                  Next
                </Link>
              )}
            </div>
          </nav>
        )}
      </CollectionFilterLayout>
    </div>
  );
}
