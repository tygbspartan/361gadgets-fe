"use client";

import { useGetFeaturedProductsQuery } from "@/lib/redux/features/products/productsApi";
import ProductGridCard from "@/components/products/ProductGridCard";
import SectionTitle from "@/components/home/SectionTitle";
import Spinner from "@/components/ui/Spinner";

export default function FeaturedProducts() {
  const { data: products, isLoading, error } = useGetFeaturedProductsQuery();

  if (isLoading) return <Spinner />;
  if (error || !products || products.length === 0) return null;

  return (
    <div>
      <SectionTitle>Shop Our Best Sellers</SectionTitle>
      <div className="mt-5 lg:mt-8.75 home-product-grid">
        {products.slice(0, 10).map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
