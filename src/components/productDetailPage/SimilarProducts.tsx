"use client";

import { Product } from "@/types/product.types";
import ProductGridCard from "@/components/products/ProductGridCard";
import { PdpHeading } from "./shared";

interface Props {
  products: Product[];
}

export default function SimilarProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div>
      <PdpHeading>Similar Products!</PdpHeading>
      <div className="home-product-grid">
        {products.map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
