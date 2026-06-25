"use client";

import { useGetRelatedProductsQuery } from "@/lib/redux/features/products/productsApi";
import ProductGridCard from "./ProductGridCard";
import Spinner from "@/components/ui/Spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
  categoryName?: string;
}

export default function RelatedProducts({
  categoryId,
  currentProductId,
  categoryName,
}: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading } = useGetRelatedProductsQuery({
    categoryId,
    currentProductId,
    limit: 8,
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) return <Spinner />;

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {categoryName ? `More from ${categoryName}` : "Related Products"}
        </h2>

        {products.length > 5 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scroll-smooth -mx-2 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-4 min-w-max">
          {products.map((product) => (
            <div key={product.id} className="w-[240px] flex-shrink-0">
              <ProductGridCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Show grid on small screens */}
      <div className="grid grid-cols-2 md:hidden gap-4 mt-4">
        {products.slice(0, 4).map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
