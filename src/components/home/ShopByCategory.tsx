"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetCategoriesQuery, Category } from "@/lib/redux/features/categories/categoriesApi";
import { useGetProductsQuery } from "@/lib/redux/features/products/productsApi";
import SectionTitle from "@/components/home/SectionTitle";
import Spinner from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";

const TARGET_NAMES = ["Cleansers", "Toners", "Moisturizers", "Sunscreen", "Facewash"];

// Normalise: lowercase + strip whitespace so "Face Wash" matches "Facewash"
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

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
    <Link href={`${ROUTES.PRODUCTS}?category=${category.slug}`} className="block w-full">
      <div className="relative w-full aspect-[317/359] rounded-[20px] border border-[#E0E0E0] shadow-[2px_2px_4px_0px_#00000026] overflow-hidden">
        {primaryImg ? (
          <Image
            src={primaryImg}
            alt={category.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Category name */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <span className="font-montserrat font-semibold text-[16px] sm:text-[20px] lg:text-[24px] leading-none text-white uppercase text-center">
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

  const allCats = categoriesData?.data ?? [];
  const categories = TARGET_NAMES
    .map((name) =>
      allCats.find((c) => norm(c.name) === norm(name))
    )
    .filter(Boolean) as Category[];

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
