"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setActiveCategorySlug } from "@/lib/redux/features/ui/uiSlice";
import { useGetProductsQuery } from "@/lib/redux/features/products/productsApi";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import ProductGridCard from "@/components/products/ProductGridCard";
import Spinner from "@/components/ui/Spinner";
import ProductFilters from "@/components/products/ProductFilters";
import ProductSort from "@/components/products/ProductSort";
import MobileFilterSheet from "@/components/products/MobileFilterSheet";
import SectionTitle from "@/components/home/SectionTitle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";

function ProductListingContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const categorySlug = searchParams.get("category");
  const brandSlug = searchParams.get("brand");
  const searchQuery = searchParams.get("search");
  const skinType = searchParams.get("skinType");
  const skinConcern = searchParams.get("skinConcern");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: productsData, isLoading, error } = useGetProductsQuery({
    page: currentPage,
    limit: 5,
    categorySlug: categorySlug || undefined,
    brandSlug: brandSlug || undefined,
    search: searchQuery || undefined,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    skinType: skinType || undefined,
    skinConcern: skinConcern || undefined,
    isActive: true,
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, brandSlug, searchQuery, skinType, skinConcern, minPrice, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    dispatch(setActiveCategorySlug(categorySlug));
    return () => { dispatch(setActiveCategorySlug(null)); };
  }, [categorySlug, dispatch]);

  const products = productsData?.data?.data || [];
  const pagination = productsData?.data?.pagination;

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
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load products</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No products found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductGridCard key={product.id} product={product} />
                ))}
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
                  "px-3 py-2 flex items-center gap-1 border border-[#E9E9E9] rounded-sm font-inter font-normal text-[14px] leading-5 text-[#313131] hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

                return (
                  <div className="mt-12 flex justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(cur - 1)}
                        disabled={cur === 1}
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
                                ? "bg-black text-white border-black font-bold"
                                : "border-[#E9E9E9] text-[#313131] hover:border-black font-normal"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => handlePageChange(cur + 1)}
                        disabled={cur === total}
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
