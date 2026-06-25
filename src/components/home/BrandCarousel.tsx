"use client";

import { useRef } from "react";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function BrandsCarousel() {
  const { data: brandsData } = useGetBrandsQuery();
  const brands = (brandsData?.data ?? []).filter((b) => b.logoUrl && b.isActive);

  if (brands.length === 0) return null;

  // Duplicate for seamless infinite loop
  const doubled = [...brands, ...brands];

  return (
    <div className="w-full overflow-hidden pt-2.5 pb-0 lg:py-5 bg-background">
      <div className="flex items-center gap-10 lg:gap-20 animate-marquee">
        {doubled.map((brand, i) => (
          <Link
            key={`${brand.id}-${i}`}
            href={`${ROUTES.PRODUCTS}?brand=${brand.slug}`}
            className="shrink-0 flex items-center justify-center w-21.75 h-12.5 md:w-27.5 md:h-17.5 lg:w-38.75 lg:h-22.5"
          >
            <Image
              src={brand.logoUrl!}
              alt={brand.name}
              width={155}
              height={90}
              className="object-contain w-21.75 h-12.5 md:w-27.5 md:h-17.5 lg:w-38.75 lg:h-22.5"
              unoptimized
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
