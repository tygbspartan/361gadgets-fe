import type { Product } from "@/types/product.types";
import ProductGridCard from "@/components/products/ProductGridCard";
import SectionTitle from "@/components/home/SectionTitle";

/* Discounted products (original price above the selling price). Data comes
   from the server (getHomeData). */
export default function SpecialOffers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

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
