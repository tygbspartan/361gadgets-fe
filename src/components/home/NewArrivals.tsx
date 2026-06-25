"use client";

import { useGetNewArrivalsQuery } from "@/lib/redux/features/products/productsApi";
import ProductGridCard from "@/components/products/ProductGridCard";
import SectionTitle from "@/components/home/SectionTitle";
import Spinner from "@/components/ui/Spinner";

interface NewArrivalsProps {
  limit?: number;
}

export default function NewArrivals({ limit = 10 }: NewArrivalsProps) {
  const { data: products, isLoading, error } = useGetNewArrivalsQuery(limit);

  if (isLoading) return <Spinner />;
  if (error || !products || products.length === 0) return null;

  return (
    <div>
      <SectionTitle>Shop New Arrivals</SectionTitle>
      <div className="mt-5 lg:mt-8.75 home-product-grid">
        {products.slice(0, 10).map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
