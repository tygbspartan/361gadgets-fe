"use client";

import { useGetSpecialOffersQuery } from "@/lib/redux/features/products/productsApi";
import ProductGridCard from "@/components/products/ProductGridCard";
import SectionTitle from "@/components/home/SectionTitle";
import Spinner from "@/components/ui/Spinner";

interface SpecialOffersProps {
  limit?: number;
}

export default function SpecialOffers({ limit = 5 }: SpecialOffersProps) {
  const { data: products, isLoading, error } = useGetSpecialOffersQuery(limit);

  if (isLoading) return <Spinner />;
  if (error || !products || products.length === 0) return null;

  return (
    <div>
      <SectionTitle>Special Offers</SectionTitle>
      <div className="mt-5 lg:mt-8.75 home-product-grid">
        {products.slice(0, 5).map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
