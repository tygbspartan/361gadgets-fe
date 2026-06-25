"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchProductsQuery } from "@/lib/redux/features/products/productsApi";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, ArrowRight, Clock } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface SearchDropdownProps {
  isMobile?: boolean;
}

export default function SearchDropdown({
  isMobile = false,
}: SearchDropdownProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results
  const {
    data: products,
    isLoading,
    isFetching,
  } = useSearchProductsQuery(
    { query: debouncedQuery, limit: 6 },
    { skip: debouncedQuery.length < 2 },
  );

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Save to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      5,
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // Navigate to search results page
    router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `Rs. ${numPrice.toLocaleString("en-NP", { minimumFractionDigits: 2 })}`;
  };

  const handleProductClick = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${isMobile ? "w-full" : "flex-1 max-w-2xl"}`}
    >
      {/* Search Input — styled like the desktop inline search pill */}
      <div className="flex items-center gap-2 h-10 border border-black rounded-[20px] px-3 bg-white">
        <Search className="h-4.5 w-4.5 text-black shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() =>
            setIsOpen(searchQuery.length > 0 || recentSearches.length > 0)
          }
          onKeyDown={handleKeyDown}
          placeholder="Type here to search"
          className="flex-1 outline-none text-[14px] text-black bg-transparent placeholder:text-gray-400"
        />

        {(isLoading || isFetching) && (
          <Loader2 className="h-4.5 w-4.5 text-gray-400 animate-spin shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50">
          {/* Loading State */}
          {(isLoading || isFetching) && debouncedQuery.length >= 2 && (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto text-red-600 animate-spin mb-2" />
              <p className="text-gray-600">Searching...</p>
            </div>
          )}

          {/* No query - Show recent searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(recent);
                      handleSearch(recent);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                  >
                    {recent}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {debouncedQuery.length >= 2 && !isLoading && !isFetching && (
            <>
              {products && products.length > 0 ? (
                <>
                  {/* Products List */}
                  <div className="divide-y">
                    {products.map((product) => {
                      const primaryImage = product.images?.find(
                        (img) => img.isPrimary,
                      );
                      const imageUrl =
                        primaryImage?.imageUrl ||
                        product.images?.[0]?.imageUrl ||
                        "https://via.placeholder.com/80";
                      const price =
                        typeof product.price === "string"
                          ? parseFloat(product.price)
                          : product.price;
                      const originalPrice = product.originalPrice
                        ? typeof product.originalPrice === "string"
                          ? parseFloat(product.originalPrice)
                          : product.originalPrice
                        : null;
                      const hasDiscount =
                        originalPrice && originalPrice > price;

                      return (
                        <Link
                          key={product.id}
                          href={`${ROUTES.PRODUCT}/${product.slug}`}
                          onClick={handleProductClick}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        >
                          {/* Product Image */}
                          <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1 mb-1">
                              {product.name}
                            </h4>
                            {product.brand && (
                              <p className="text-xs text-gray-500 mb-1">
                                {product.brand.name}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">
                                {formatPrice(product.price)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.originalPrice!)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stock Status */}
                          {product.stockQuantity === 0 && (
                            <span className="text-xs text-red-600 font-medium">
                              Out of Stock
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* View All Results */}
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="w-full p-4 text-center text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    View all results for "{searchQuery}"
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                /* No Results */
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-2">
                    No products found for "{debouncedQuery}"
                  </p>
                  <p className="text-sm text-gray-500">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </>
          )}

          {/* Initial State - Show hint */}
          {!searchQuery && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 text-sm">
                Start typing to search products
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
