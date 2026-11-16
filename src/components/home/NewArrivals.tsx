import type { Product } from "@/types/product.types";
import ProductGridCard from "@/components/products/ProductGridCard";
import SectionTitle from "@/components/home/SectionTitle";

/* Newest products. Data comes from the server (getHomeData). */
export default function NewArrivals({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div>
      <SectionTitle>Shop New Arrivals</SectionTitle>
      <div className="mt-5 lg:mt-8.75 home-product-grid home-grid-15">
        {products.slice(0, 16).map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
