"use client";

import { useState, useEffect } from "react";
import PageLoader from "@/components/ui/PageLoader";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import { useGetFeaturedProductsQuery } from "@/lib/redux/features/products/productsApi";

export default function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  // Preload critical data
  const { isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { isLoading: brandsLoading } = useGetBrandsQuery();
  const { isLoading: productsLoading } = useGetFeaturedProductsQuery();

  useEffect(() => {
    // Wait for critical data to load
    if (!categoriesLoading && !brandsLoading && !productsLoading) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [categoriesLoading, brandsLoading, productsLoading]);

  if (!isReady) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
