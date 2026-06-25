"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useRef } from "react";
import { Product } from "@/types/product.types";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { useWishlist } from "@/lib/redux/features/wishlist/useWishlist";
import { ROUTES } from "@/constants/routes";
import { useFly } from "@/components/providers/FlyProvider";
import { useToast } from "@/components/ui/ToastStack";

interface Props {
  product: Product;
}

export default function ProductGridCard({ product }: Props) {
  const { flyToCart, flyToWishlist } = useFly();
  const { showToast } = useToast();
  const imgRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, addItem: addToWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const sortedImages =
    product.images && product.images.length > 0
      ? [...product.images].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return a.displayOrder - b.displayOrder;
        })
      : [];
  const primaryImg = sortedImages[0]?.imageUrl;
  const hoverImg = sortedImages[1]?.imageUrl ?? primaryImg;

  const inWishlist = isInWishlist(product.id);
  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;
  const saveAmount = hasDiscount ? product.originalPrice! - product.price : 0;
  const isOOS = product.stockQuantity === 0;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inWishlist) {
      const rect = imgRef.current?.getBoundingClientRect();
      if (rect && primaryImg) flyToWishlist(rect, primaryImg);
      try {
        await addToWishlist(product);
        showToast({
          icon: "hugeicons:heart-add",
          title: "Added to Wishlist!",
          variant: "positive",
        });
      } catch {}
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOOS) return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (rect && primaryImg) flyToCart(rect, primaryImg);
    try {
      await addToCart(product, 1);
      showToast({
        icon: "hugeicons:shopping-cart-check-in-02",
        title: "Added to Cart!",
        variant: "positive",
      });
    } catch {}
  };

  return (
    <div className="rounded-[10px] border border-[#E0E0E0] p-3 lg:p-5 flex flex-col group shadow-[2px_2px_4px_0px_#00000026]">
      <Link
        href={`${ROUTES.PRODUCT}/${product.slug}`}
        className="block relative"
      >
        <div
          ref={imgRef}
          className="relative w-full aspect-square overflow-hidden rounded-[5px] bg-[#F8F8F8]"
        >
          {primaryImg ? (
            <>
              <Image
                src={primaryImg}
                alt={product.name}
                fill
                className="object-cover transition-all duration-300 group-hover:opacity-0 group-hover:scale-105"
              />
              <Image
                src={hoverImg ?? primaryImg}
                alt={product.name}
                fill
                className="object-cover scale-105 opacity-0 transition-all duration-300 group-hover:opacity-100"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[3px]" />
          <button
            onClick={handleWishlist}
            className="group/heart absolute top-2 right-2 w-5.5 h-5.5 lg:w-8.5 lg:h-8.5 rounded-full bg-white flex items-center justify-center p-1 lg:p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Add to wishlist"
          >
            <span className="relative inline-block w-3.25 h-3.25 lg:w-4.5 lg:h-4.5">
              <Icon
                icon="fa:heart-o"
                className={`w-full h-full text-foreground transition-opacity ${inWishlist ? "opacity-0" : "group-hover/heart:opacity-0"}`}
              />
              <Icon
                icon="fa:heart"
                className={`w-full h-full text-primary absolute inset-0 transition-opacity ${inWishlist ? "opacity-100" : "opacity-0 group-hover/heart:opacity-100"}`}
              />
            </span>
          </button>
        </div>
      </Link>

      <Link href={`${ROUTES.PRODUCT}/${product.slug}`} className="mt-2.25">
        {product.brand?.name && (
          <p className="font-inter font-normal text-[10px] lg:text-[12px] leading-none text-[#4B4B4B] mb-0.75">
            {product.brand.name}
          </p>
        )}
        <p
          title={product.name}
          className="font-montserrat font-normal lg:font-medium text-[12px] lg:text-[16px] leading-[1.2] text-foreground line-clamp-2 hover:text-primary transition-colors"
        >
          {product.name}
        </p>
      </Link>

      <div className="mt-2.25 lg:mt-auto">
        <div className="lg:mt-2.5 flex items-start justify-between gap-2">
          {/* Prices: original sits to the right of discounted when there's room,
            otherwise it wraps below. */}
          <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1 min-w-0">
            <span className="whitespace-nowrap font-montserrat font-semibold text-[13px] lg:text-[19px] leading-none text-black">
              Rs. {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="whitespace-nowrap font-montserrat font-semibold text-[10px] lg:text-[13px] line-through text-[#747373]">
                Rs. {product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="shrink-0 bg-[#15792B] rounded-xs px-1.5 py-px font-inter font-semibold text-[8px] lg:text-[12px] text-center text-white">
              Save Rs. {saveAmount.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOOS}
          className="mt-2.25 w-full bg-black text-white font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-2 lg:px-2.5 py-0 lg:py-1.5 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
        >
          {isOOS ? "OUT OF STOCK" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}
