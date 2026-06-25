"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Product } from "@/types/product.types";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { useWishlist } from "@/lib/redux/features/wishlist/useWishlist";
import { StarDisplay, ReviewSummary } from "./shared";
import { useFly } from "@/components/providers/FlyProvider";
import { useToast } from "@/components/ui/ToastStack";

interface Props {
  product: Product;
  summary?: ReviewSummary;
}

export default function ProductDetails({
  product,
  summary,
}: Props) {
  const { addItem: addToCart } = useCart();
  const { isInWishlist: isInWishlistFn, addItem: addToWishlist } = useWishlist();
  const isInWishlist = isInWishlistFn(product.id);
  const { flyToCart, flyToWishlist } = useFly();
  const { showToast } = useToast();
  const mainImgRef = useRef<HTMLDivElement>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images =
    product.images && product.images.length > 0
      ? [...product.images].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return a.displayOrder - b.displayOrder;
        })
      : [];

  const mainImage = images[selectedImageIndex];

  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;
  const saveAmount = hasDiscount ? product.originalPrice! - product.price : 0;

  const isOOS = product.stockQuantity === 0;
  const isLowStock = !isOOS && product.stockQuantity <= product.lowStockThreshold;
  const stockLabel = isOOS
    ? "Out of Stock"
    : isLowStock
    ? `Low Stock — Only ${product.stockQuantity} left`
    : "In Stock";

  const handleAddToCart = async () => {
    const rect = mainImgRef.current?.getBoundingClientRect();
    if (rect && mainImage) flyToCart(rect, mainImage.imageUrl);
    try {
      await addToCart(product, quantity);
      setQuantity(1);
      showToast({ icon: "hugeicons:shopping-cart-check-in-02", title: "Added to Cart!", variant: "positive" });
    } catch {}
  };

  const handleWishlist = async () => {
    if (!isInWishlist) {
      const rect = mainImgRef.current?.getBoundingClientRect();
      if (rect && mainImage) flyToWishlist(rect, mainImage.imageUrl);
      try {
        await addToWishlist(product);
        showToast({ icon: "hugeicons:heart-add", title: "Added to Wishlist!", variant: "positive" });
      } catch {}
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">

      {/* LEFT — Image gallery (60%) */}
      <div className="w-full lg:w-[60%] flex flex-col lg:flex-row gap-3">

        {/* Main image — top on mobile, right on desktop */}
        <div ref={mainImgRef} className="order-1 lg:order-2 w-full lg:flex-1 relative aspect-square overflow-hidden bg-[#F8F8F8]">
          {mainImage ? (
            <Image
              src={mainImage.imageUrl}
              alt={mainImage.altText ?? product.name}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="font-inter text-sm text-gray-400">No image</span>
            </div>
          )}
        </div>

        {/* Thumbnails — below on mobile (3 visible, x-scroll), column on desktop */}
        {images.length > 0 && (
          <div className="order-2 lg:order-1 flex flex-row lg:flex-col gap-2.5 lg:gap-6.25 shrink-0 lg:w-1/6 mt-3.75 lg:mt-0 overflow-x-auto lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative thumb-strip-item aspect-square overflow-hidden bg-[#F8F8F8] border-[0.5px] border-[#C9C9C9] transition-all ${
                  selectedImageIndex === idx
                    ? "shadow-[0px_2px_4px_0px_#00000026]"
                    : "opacity-60 hover:opacity-90"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.altText ?? product.name}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — Product details (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col gap-0 lg:gap-6.25">

        {/* Stock status */}
        <p className="font-inter font-normal text-[14px] lg:text-base leading-none uppercase tracking-normal text-[#4B4B4B]">
          {stockLabel}
        </p>

        {/* Name + Price (6px gap) */}
        <div className="flex flex-col gap-1.5 mt-2.5 lg:mt-0">
          <h1 className="font-montserrat font-normal text-[18px] lg:text-2xl leading-tight text-black">
            {product.name}
          </h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            {hasDiscount && (
              <span className="font-montserrat font-medium text-[14px] lg:text-[22px] leading-none text-[#B1A6A6] line-through">
                Rs. {product.originalPrice!.toLocaleString()}
              </span>
            )}
            <span className="font-montserrat font-medium text-[20px] lg:text-[22px] leading-none text-black">
              Rs. {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="bg-[#15792B] rounded-xs text-white font-inter font-semibold text-[14px] leading-5.5 text-center px-2">
                Save Rs. {saveAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Rating + share + wishlist */}
        <div className="flex items-center gap-3 mt-5 lg:mt-0">
          <StarDisplay rating={summary?.averageRating ?? 0} size={24} />
          <span className="font-inter font-medium text-[20px] leading-none text-[#4B4B4B]">
            ({summary?.totalReviews ?? 0})
          </span>
          <div className="ml-auto flex items-center gap-4">
            <button onClick={handleShare} className="hover:opacity-60 transition-opacity" aria-label="Share">
              <Icon icon="tdesign:share-filled" width={24} height={24} />
            </button>
            <button onClick={handleWishlist} className="group" aria-label="Wishlist">
              <span className="relative inline-block w-6 h-6">
                <Icon
                  icon="fa:heart-o"
                  width={24}
                  height={24}
                  className={`text-primary transition-opacity ${isInWishlist ? "opacity-0" : "group-hover:opacity-0"}`}
                />
                <Icon
                  icon="fa:heart"
                  width={24}
                  height={24}
                  className={`text-primary absolute inset-0 transition-opacity ${isInWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Select Quantity + stepper + add to cart */}
        <div className="flex flex-col gap-2.5 mt-5 lg:mt-0">
          <span className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-[#4B4B4B]">
            Select Quantity
          </span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOOS || quantity <= 1}
                className="w-10 h-10 border border-[#D4D4D4] rounded-[3px] flex items-center justify-center font-inter font-normal text-base uppercase disabled:opacity-40 disabled:cursor-not-allowed"
              >
                −
              </button>
              <div className="w-10 h-10 border border-[#D4D4D4] rounded-[3px] flex items-center justify-center font-inter font-normal text-base uppercase">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                disabled={isOOS || quantity >= product.stockQuantity}
                className="w-10 h-10 border border-[#D4D4D4] rounded-[3px] flex items-center justify-center font-inter font-normal text-base uppercase disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOOS}
              className="w-32.25 h-10 bg-black text-white font-inter font-medium text-[14px] lg:text-base leading-none uppercase rounded-[3px] px-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
            >
              {isOOS ? "OUT OF STOCK" : "ADD TO CART"}
            </button>
          </div>
        </div>

        {/* Product Overview */}
        <div className="flex flex-col gap-2.5 mt-5 lg:mt-0">
          <p className="font-inter font-normal text-[14px] lg:text-base leading-none uppercase text-primary">
            Product Overview
          </p>
          {product.brand && (
            <div className="flex flex-col gap-1.25">
              <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Brand</p>
              <p className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-justify text-[#4B4B4B]">
                {product.brand.name}
              </p>
            </div>
          )}
          {product.category && (
            <div className="flex flex-col gap-1.25">
              <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Product Type</p>
              <p className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-justify text-[#4B4B4B]">
                {product.category.name}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1.25">
            <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Country of Origin</p>
            <p className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-justify text-[#4B4B4B]">—</p>
          </div>
          {product.longDescription && (
            <div className="flex flex-col gap-1.25">
              <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Description</p>
              <p className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-justify text-[#4B4B4B] whitespace-pre-line">
                {product.longDescription}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
