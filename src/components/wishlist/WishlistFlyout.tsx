"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import ResponsiveFlyout from "@/components/ui/ResponsiveFlyout";
import { ROUTES } from "@/constants/routes";
import { Icon } from "@iconify/react";
import { useBulkMoveToCartMutation } from "@/lib/redux/features/wishlist/wishlistApi";
import { useWishlist } from "@/lib/redux/features/wishlist/useWishlist";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { Product } from "@/types/product.types";
import { useToast } from "@/components/ui/ToastStack";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WishlistFlyout({ open, onClose }: Props) {
  const { items: wishlistItems, isLoading, isGuest, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [bulkMoveToCart, { isLoading: isMoving }] = useBulkMoveToCartMutation();
  const [isMovingGuest, setIsMovingGuest] = useState(false);
  const { showToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setErrorMsg(null);
    }
  }, [open]);

  const getQty = (id: number) => quantities[id] ?? 1;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeQty = (id: number, delta: number, max: number) => {
    setQuantities((prev) => {
      const cur = prev[id] ?? 1;
      const next = Math.min(Math.max(1, cur + delta), max);
      return { ...prev, [id]: next };
    });
  };

  const handleMoveToCart = async () => {
    if (selectedIds.size === 0) return;
    setErrorMsg(null);

    // Guests: move locally (add to guest cart, remove from guest wishlist).
    if (isGuest) {
      setIsMovingGuest(true);
      try {
        for (const id of Array.from(selectedIds)) {
          const item = wishlistItems.find((w) => w.id === id);
          if (!item?.product) continue;
          const p = {
            ...item.product,
            price: Number(item.product.price),
            originalPrice:
              item.product.originalPrice != null ? Number(item.product.originalPrice) : null,
          } as unknown as Product;
          await addToCart(p, getQty(id));
          await removeItem(item);
        }
        setSelectedIds(new Set());
      } finally {
        setIsMovingGuest(false);
      }
      return;
    }

    const items = Array.from(selectedIds).map((id) => ({
      wishlistItemId: id,
      quantity: getQty(id),
    }));

    try {
      const result = await bulkMoveToCart({ items }).unwrap();
      setSelectedIds(new Set());

      if (result.data?.failedCount > 0) {
        const reasons =
          result.data.failedItems?.map((f) => f.reason).join(", ") ?? "Unknown error";
        setErrorMsg(`${result.data.failedCount} item(s) couldn't be moved: ${reasons}`);
      }
    } catch {
      setErrorMsg("Failed to move items to cart. Please try again.");
    }
  };

  return (
    <ResponsiveFlyout open={open} onClose={onClose}>
        {/* ── Header — centered, underline extends 10px beyond icon+text ── */}
        <div className="h-15.5 flex items-center justify-center shrink-0 lg:border-b-[0.5px] border-[#B9B7B7]">
          <div className="relative pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:heart-outline" width={20} height={20} className="text-primary" />
              <span className="font-inter font-medium text-base leading-none tracking-normal">
                My Wishlist
              </span>
            </div>
            {/* Underline: 2px, 10px wider than content on each side */}
            <div className="absolute -bottom-0.5 -left-2.5 -right-2.5 h-0.5 bg-primary" />
          </div>
        </div>

        {/* ── Body — scrollable ── */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 px-6 space-y-5">
          {isLoading ? (
            <p className="text-sm text-gray-500 text-center mt-10">Loading…</p>
          ) : wishlistItems.length === 0 ? (
            <EmptyState
              icon="solar:heart-outline"
              title="Your wishlist is empty."
              description="Looks like you haven't added anything to your wishlist yet."
              buttonText="Explore Products"
            />
          ) : (
            wishlistItems.map((item, idx) => {
              const product = item.product;
              const isOOS =
                !product ||
                product.stockQuantity === 0 ||
                product.stockStatus === "out_of_stock";
              const primaryImage =
                product?.images?.find((img) => img.isPrimary)?.imageUrl ??
                product?.images?.[0]?.imageUrl;
              const stock = product?.stockQuantity ?? 0;
              const qty = getQty(item.id);
              const isSelected = selectedIds.has(item.id);

              return (
                <Fragment key={item.id}>
                <div className="flex items-start gap-3">
                  {/* Checkbox — vertically centered in the card row */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isOOS}
                    onChange={() => !isOOS && toggleSelect(item.id)}
                    className={`w-4 h-4 self-center shrink-0 accent-black ${
                      isOOS ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  />

                  {/* Image */}
                  <Link href={`${ROUTES.PRODUCT}/${product?.slug}`} onClick={onClose} className="relative shrink-0 w-19 h-19 lg:w-30 lg:h-30 border-[0.5px] border-[#C9C9C9] overflow-hidden block">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product?.name ?? "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                    {isOOS && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#00000080]">
                        <span className="font-inter font-semibold text-[12px] text-white leading-none tracking-normal uppercase text-center px-2">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Info: title + quantity */}
                  <div className="flex-1 min-w-0">
                    <Link href={`${ROUTES.PRODUCT}/${product?.slug}`} onClick={onClose}>
                      <p
                        className={`font-montserrat font-medium text-[14px] lg:text-base leading-tight hover:text-primary transition-colors ${
                          isOOS ? "text-[#747373]" : "text-foreground"
                        }`}
                      >
                        {product?.name}
                      </p>
                    </Link>

                    {/* Quantity stepper with gaps between boxes */}
                    <div className="flex items-center gap-1.5 mt-3">
                      <button
                        onClick={() => changeQty(item.id, -1, stock)}
                        disabled={isOOS || qty <= 1}
                        className={`px-[9.5px] py-1.5 lg:p-0 lg:w-8.75 lg:h-8.75 border border-[#C9C9C9] flex items-center justify-center font-inter text-[9.6px] lg:text-sm font-normal leading-none uppercase lg:normal-case ${
                          isOOS ? "text-[#747373]" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        −
                      </button>
                      <div
                        className={`px-[9.5px] py-1.5 lg:p-0 lg:w-8.75 lg:h-8.75 border border-[#C9C9C9] flex items-center justify-center font-inter text-[9.6px] lg:text-sm font-normal leading-none uppercase lg:normal-case ${
                          isOOS ? "text-[#747373]" : ""
                        }`}
                      >
                        {qty}
                      </div>
                      <button
                        onClick={() => changeQty(item.id, 1, stock)}
                        disabled={isOOS || qty >= stock}
                        className={`px-[9.5px] py-1.5 lg:p-0 lg:w-8.75 lg:h-8.75 border border-[#C9C9C9] flex items-center justify-center font-inter text-[9.6px] lg:text-sm font-normal leading-none uppercase lg:normal-case ${
                          isOOS ? "text-[#747373]" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Delete (top) + price (center) */}
                  <div className="shrink-0 self-stretch flex flex-col items-end">
                    <button
                      onClick={async () => {
                        try {
                          await removeItem(item);
                          showToast({ icon: "hugeicons:heart-remove", title: "Removed from Wishlist!", variant: "negative" });
                        } catch {}
                      }}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      <Icon icon="proicons:delete" className="w-3.5 h-3.5 lg:w-6 lg:h-6" />
                    </button>
                    <div className="flex-1 flex items-center">
                      <span
                        className={`font-montserrat font-semibold text-[12px] lg:text-base leading-none ${
                          isOOS ? "text-[#747373]" : "text-foreground"
                        }`}
                      >
                        Rs. {product?.price ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
                {idx < wishlistItems.length - 1 && (
                  <div className="lg:hidden ml-7 border-t border-[#E5E5E5]" />
                )}
                </Fragment>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 pt-4 pb-8 lg:pb-4 border-t-[0.5px] border-[#B9B7B7]">
          {errorMsg && (
            <p className="text-sm text-primary mb-3">{errorMsg}</p>
          )}
          <button
            onClick={handleMoveToCart}
            disabled={selectedIds.size === 0 || isMoving || isMovingGuest}
            className="w-full bg-black text-white font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-2 lg:px-2.5 py-0 lg:py-1.5 flex items-center justify-center transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isMoving || isMovingGuest ? "ADDING…" : "ADD TO CART"}
          </button>
        </div>
    </ResponsiveFlyout>
  );
}
