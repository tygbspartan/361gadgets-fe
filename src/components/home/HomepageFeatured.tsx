"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useGetProductsQuery } from "@/lib/redux/features/products/productsApi";
import { Product } from "@/types/product.types";
import { ROUTES } from "@/constants/routes";

function FeaturedCard({ product, index }: { product: Product; index: number }) {
  const isImageLeft = index % 2 === 0;

  const primaryImg =
    product.images?.find((i) => i.isPrimary)?.imageUrl ??
    product.images?.[0]?.imageUrl;

  const ImageBlock = (
    <div className="order-2 lg:order-0 w-full lg:w-1/2 aspect-square md:aspect-auto md:h-150 lg:h-full overflow-hidden">
      {primaryImg ? (
        <img
          src={primaryImg}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#2a2a2a]" />
      )}
    </div>
  );

  const DetailsBlock = (
    <div className="order-1 lg:order-0 w-full lg:w-1/2 lg:h-full px-6 lg:px-12 pb-6 md:pt-37 lg:py-0 flex flex-col relative">
      {/* OUR BEST SELLER — in-flow on mobile, absolutely centered on desktop */}
      <div className="lg:absolute lg:inset-0 flex items-center justify-center pointer-events-none mt-30 mb-20 pb-4 md:pb-16.25 lg:mt-0 lg:mb-0 lg:pb-0">
        <p className="font-inter font-normal text-[27.92px] lg:text-[40px] leading-none text-white text-center">
          OUR BEST SELLER
        </p>
      </div>

      {/* Bottom row sits above the absolute title */}
      <div className="lg:mt-auto lg:pb-12.5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 lg:gap-6 xl:gap-25 relative z-10">
        {/* Bottom-left: name + description */}
        <div className="min-w-0 flex-1">
          <p className="font-montserrat font-normal text-[16px] md:text-[20px] lg:text-[22px] xl:text-[24px] leading-tight tracking-wide uppercase text-white pb-2 border-b-2 border-[#4B4B4B]">
            {product.name}
          </p>
          <p className="mt-3 font-inter font-normal text-[12px] md:text-[14px] lg:text-[16px] leading-[16.75px] lg:leading-6 tracking-[0.02em] text-white line-clamp-4">
            {product.shortDescription ?? product.longDescription ?? ""}
          </p>
        </div>

        {/* Bottom-right: SHOP PRODUCT + arrow */}
        <Link
          href={`${ROUTES.PRODUCT}/${product.slug}`}
          className="shrink-0 flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <span className="font-inter font-medium text-[12px] md:text-[14px] lg:text-[16px] leading-none uppercase text-white">
            SHOP PRODUCT
          </span>
          <span className="rotate-90 inline-flex">
            <Icon icon="solar:arrow-up-outline" width={17} height={17} className="text-white" />
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full h-auto lg:h-218.75">
      {isImageLeft ? (
        <>{ImageBlock}{DetailsBlock}</>
      ) : (
        <>{DetailsBlock}{ImageBlock}</>
      )}
    </div>
  );
}

export default function HomepageFeatured() {
  const { data, isLoading } = useGetProductsQuery({
    homepageFeature: true,
    limit: 10,
    isActive: true,
  });

  if (isLoading) return (
    <div className="w-full bg-[#191919] flex items-center justify-center h-218.75">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  const products = data?.data.data ?? [];
  if (products.length === 0) return null;

  return (
    <div className="w-full bg-[#191919]">
      {products.map((product, index) => (
        <FeaturedCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
