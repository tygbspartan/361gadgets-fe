"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetCategoriesQuery, Category } from "@/lib/redux/features/categories/categoriesApi";
import { useGetProductsQuery } from "@/lib/redux/features/products/productsApi";
import SectionTitle from "@/components/home/SectionTitle";
import Spinner from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";

const MAX_TILES = 5;

function CategoryCard({ category }: { category: Category }) {
  const { data } = useGetProductsQuery({
    categorySlug: category.slug,
    limit: 1,
    isActive: true,
  });

  const product = data?.data?.data?.[0];
  const primaryImg =
    product?.images?.find((i) => i.isPrimary)?.imageUrl ??
    product?.images?.[0]?.imageUrl;

  return (
    <Link href={`${ROUTES.PRODUCTS}?category=${category.slug}`} data-cursor="Explore" className="block w-full">
      <div className="surface-card hover-lift group relative w-full aspect-317/359 rounded-2xl overflow-hidden">
        {primaryImg ? (
          <Image
            src={primaryImg}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100" />
        )}

        {/* Scrim: heavier at the base so the label stays legible over any shot. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/25 transition-opacity duration-300 group-hover:from-black/75" />

        {/* Floor line that grows in on hover. White, not primary: this sits on
            the dark scrim, where near-black ink would disappear. */}
        <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />

        <div className="absolute inset-0 flex items-end justify-center p-4">
          <span className="font-montserrat font-semibold text-[16px] sm:text-[20px] lg:text-[22px] leading-tight text-white uppercase text-center tracking-[0.04em] transition-colors duration-300 group-hover:text-gray-300">
            {category.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ShopByCategory() {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery();

  if (isLoading) return <Spinner />;

  /*
   * Derived from the catalogue rather than a hardcoded name list, so the tiles
   * always reflect real categories. Top-level only, in admin display order.
   */
  const categories = (categoriesData?.data ?? [])
    .filter((c) => c.isActive && c.parentId === null)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
    .slice(0, MAX_TILES);

  if (categories.length === 0) return null;

  return (
    <div>
      <SectionTitle>Shop by Category</SectionTitle>
      <div className="mt-5 lg:mt-8.75 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
