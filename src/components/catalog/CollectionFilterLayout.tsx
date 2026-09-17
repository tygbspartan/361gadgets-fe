"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import ProductFilters from "@/components/products/ProductFilters";
import ProductSort from "@/components/products/ProductSort";
import MobileFilterSheet from "@/components/products/MobileFilterSheet";
import SectionTitle from "@/components/home/SectionTitle";

export interface BrandOption {
  id: number;
  name: string;
  slug: string;
}

/**
 * Products-page-style shell (filter sidebar + sort + mobile filter sheet) for
 * the SEO category/brand pages. The product grid + pagination are passed as
 * `children` and stay server-rendered (crawlable); the filters here only push
 * to the URL, and the server re-renders the filtered grid.
 */
export default function CollectionFilterLayout({
  title,
  brands,
  showBrandFilter = true,
  children,
}: {
  title: string;
  brands: BrandOption[];
  showBrandFilter?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;

  // Price is URL-driven here (unlike /products, which keeps it in local state),
  // so a change re-renders the server grid.
  const handlePriceChange = (min?: number, max?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min != null && !Number.isNaN(min)) params.set("minPrice", String(min));
    else params.delete("minPrice");
    if (max != null && !Number.isNaN(max)) params.set("maxPrice", String(max));
    else params.delete("maxPrice");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const filters = (variant: "sidebar" | "sheet") => (
    <ProductFilters
      variant={variant}
      brands={brands}
      showBrandFilter={showBrandFilter}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onPriceChange={handlePriceChange}
    />
  );

  return (
    <>
      {/* Mobile: centered page title */}
      <div className="lg:hidden">
        <SectionTitle>{title}</SectionTitle>
      </div>

      <div className="flex gap-9">
        {/* Filters — 20%, desktop only */}
        <aside className="hidden lg:block w-1/5 shrink-0">{filters("sidebar")}</aside>

        {/* Main — 80% */}
        <div className="flex-1 min-w-0">
          {/* Desktop: Title + Sort */}
          <div className="hidden lg:flex items-center justify-between mb-5">
            <div className="w-fit">
              <h1 className="font-montserrat font-medium text-[24px] leading-none text-black">
                {title}
              </h1>
              <div className="h-0.5 bg-primary mt-1.5" />
            </div>
            <ProductSort />
          </div>

          {/* Mobile: Filter button + Sort */}
          <div className="lg:hidden flex items-center justify-between mt-5 mb-5">
            <button
              onClick={() => setMobileFiltersOpen((o) => !o)}
              className="flex items-center gap-2 border border-[#D4D4D4] rounded-[5px] p-2.5"
            >
              <Icon icon="ci:filter" width={16} height={16} className="text-black" />
              <span className="font-inter font-normal text-[12px] leading-none text-black">
                Filter
              </span>
            </button>
            <ProductSort />
          </div>

          {/* Server-rendered grid + pagination (and SEO intro) */}
          {children}
        </div>
      </div>

      {/* Mobile filter flyout */}
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      >
        {filters("sheet")}
      </MobileFilterSheet>
    </>
  );
}
