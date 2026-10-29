"use client";

import { useState, useEffect, useLayoutEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setActiveCategorySlug } from "@/lib/redux/features/ui/uiSlice";
import { useGetProductsQuery } from "@/lib/redux/features/products/productsApi";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import ProductGridCard from "@/components/products/ProductGridCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import Spinner from "@/components/ui/Spinner";
import ProductFilters from "@/components/products/ProductFilters";
import ProductSort from "@/components/products/ProductSort";
import MobileFilterSheet from "@/components/products/MobileFilterSheet";
import SectionTitle from "@/components/home/SectionTitle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";

const PAGE_SIZE = 5;
/** Longest the new batch waits on its images before showing regardless. */
const REVEAL_CAP_MS = 2500;

function ProductListingContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const categorySlug = searchParams.get("category");
  const brandSlug = searchParams.get("brand");
  const searchQuery = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /*
   * `currentData`, not `data`: on a page/filter change RTK Query keeps handing
   * back the previous result in `data` until the new one lands, which left the
   * old batch on screen. `currentData` is undefined until the response for
   * *these* args arrives, so the grid can show placeholders instead.
   */
  const {
    data: lastData,
    currentData: productsData,
    isFetching,
    error,
  } = useGetProductsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    categorySlug: categorySlug || undefined,
    brandSlug: brandSlug || undefined,
    search: searchQuery || undefined,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    isActive: true,
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, brandSlug, searchQuery, minPrice, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    dispatch(setActiveCategorySlug(categorySlug));
    return () => { dispatch(setActiveCategorySlug(null)); };
  }, [categorySlug, dispatch]);

  const products = productsData?.data?.data || [];
  // The last known page count keeps the pagination bar in place while the
  // next page loads, rather than vanishing and reappearing.
  const pagination = (productsData ?? lastData)?.data?.pagination;

  /*
   * Hold the new batch back until its images are in, so it appears in one go
   * instead of as empty cards filling in. The grid renders invisibly behind
   * the placeholders; once every image in or near the viewport has loaded (or
   * failed), it's revealed. Capped so one slow image can't stall the page.
   */
  const gridRef = useRef<HTMLDivElement>(null);
  const [readyFor, setReadyFor] = useState<typeof productsData>(undefined);
  const revealed = productsData !== undefined && readyFor === productsData;

  useLayoutEffect(() => {
    if (!productsData) return;
    const grid = gridRef.current;
    const pending = grid
      ? [...grid.querySelectorAll("img")].filter(
          (img) => !img.complete && img.getBoundingClientRect().top < window.innerHeight * 1.5,
        )
      : [];

    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setReadyFor(productsData);
    };
    // Everything already cached (e.g. going back to a page seen before):
    // reveal before paint, so there's no one-frame flash of placeholders.
    if (pending.length === 0) {
      reveal();
      return;
    }

    let left = pending.length;
    const onSettled = () => {
      left -= 1;
      if (left === 0) reveal();
    };
    pending.forEach((img) => {
      img.addEventListener("load", onSettled, { once: true });
      img.addEventListener("error", onSettled, { once: true });
    });
    const cap = window.setTimeout(reveal, REVEAL_CAP_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(cap);
      pending.forEach((img) => {
        img.removeEventListener("load", onSettled);
        img.removeEventListener("error", onSettled);
      });
    };
  }, [productsData]);

  const getCategoryName = () => {
    if (!categorySlug || !categoriesData?.data) return null;
    return categoriesData.data.find((cat) => cat.slug === categorySlug)?.name;
  };

  const getBrandName = () => {
    if (!brandSlug || !brandsData?.data) return null;
    return brandsData.data.find((b) => b.slug === brandSlug)?.name;
  };

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : getCategoryName() || getBrandName() || "All Products";

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-wrapper">
      {/* Mobile: centered page title */}
      <div className="lg:hidden">
        <SectionTitle>{pageTitle}</SectionTitle>
      </div>

      <div className="flex gap-9">
        {/* Filters — 20%, desktop only */}
        <aside className="hidden lg:block w-1/5 shrink-0">
          <ProductFilters
            brands={brandsData?.data || []}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />
        </aside>

        {/* Products — 80% */}
        <div className="flex-1 min-w-0">
          {/* Desktop: Title + Sort */}
          <div className="hidden lg:flex items-center justify-between mb-5">
            <div className="w-fit">
              <h1 className="font-montserrat font-medium text-[24px] leading-none text-black">
                {pageTitle}
              </h1>
              <div className="h-0.5 bg-primary mt-1.5" />
            </div>
            <ProductSort />
          </div>

          {/* Mobile: Filter button + Sort by */}
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

          {/* Content */}
          {error && !isFetching ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load products</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : productsData && products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No products found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="relative" aria-busy={!revealed}>
                {!revealed && (
                  <>
                    <span className="sr-only" role="status">Loading products</span>
                    <div className="products-grid">
                      {Array.from({ length: PAGE_SIZE }, (_, i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </div>
                  </>
                )}
                {/* Laid out (so its images load) but invisible until ready;
                    sits over the placeholders until then. */}
                {productsData && (
                  <div
                    ref={gridRef}
                    className={`products-grid transition-opacity duration-300 ${
                      revealed ? "opacity-100" : "pointer-events-none absolute inset-x-0 top-0 opacity-0"
                    }`}
                  >
                    {products.map((product) => (
                      <ProductGridCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>

              {pagination && pagination.totalPages > 1 && (() => {
                const total = pagination.totalPages;
                const cur = currentPage;
                // Always show page 1 and the last page; show a window of up to
                // 4 page numbers with "…" filling the gaps.
                let items: (number | "ellipsis")[];
                if (total <= 5) {
                  items = Array.from({ length: total }, (_, i) => i + 1);
                } else if (cur <= 3) {
                  items = [1, 2, 3, 4, "ellipsis", total];
                } else if (cur >= total - 2) {
                  items = [1, "ellipsis", total - 3, total - 2, total - 1, total];
                } else {
                  items = [1, "ellipsis", cur - 1, cur, cur + 1, "ellipsis", total];
                }

                const navClass =
                  "px-3 py-2 flex items-center gap-1 border border-[#E9E9E9] rounded-sm font-inter font-normal text-[14px] leading-5 text-[#313131] hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

                return (
                  <div className="mt-12 flex justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(cur - 1)}
                        disabled={cur === 1}
                        data-cursor-disabled="Already on the first page"
                        className={navClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>

                      {items.map((item, idx) =>
                        item === "ellipsis" ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-1 font-inter font-normal text-[14px] leading-5 text-[#313131]"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            className={`px-3 py-2 flex items-center justify-center border rounded-sm font-inter text-[14px] leading-5 transition-colors ${
                              item === cur
                                ? "bg-primary text-primary-foreground border-primary font-bold"
                                : "border-[#E9E9E9] text-[#313131] hover:border-primary hover:text-primary font-normal"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => handlePageChange(cur + 1)}
                        disabled={cur === total}
                        data-cursor-disabled="Already on the last page"
                        className={navClass}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter flyout */}
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      >
        <ProductFilters
          variant="sheet"
          brands={brandsData?.data || []}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }}
        />
      </MobileFilterSheet>
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={<Spinner className="min-h-[60vh]" />}>
      <ProductListingContent />
    </Suspense>
  );
}
