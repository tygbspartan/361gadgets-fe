"use client";

import { Product } from "@/types/product.types";
import ProductGridCard from "@/components/products/ProductGridCard";

interface Props {
  products: Product[];
}

export default function SimilarProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="font-montserrat font-medium text-[18px] lg:text-2xl leading-none text-black w-fit mx-auto lg:mx-0 text-center border-b-2 border-primary pb-1 mb-5">
        Similar Products!
      </h2>
      <div className="home-product-grid">
        {products.map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
