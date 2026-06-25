"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import ResponsiveFlyout from "@/components/ui/ResponsiveFlyout";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { useToast } from "@/components/ui/ToastStack";
import { CartItem } from "@/types/cart.types";
import { ROUTES } from "@/constants/routes";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartFlyout({ open, onClose }: Props) {
  const router = useRouter();

  const { items: cartItems, isLoading, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});

  // Sync local quantities from server whenever cartItems changes.
  // Server data is always authoritative here — it only arrives after the API responds,
  // so by the time this runs the value is correct. The optimistic update in changeQty
  // still works because it sets localQuantities before the refetch lands.
  useEffect(() => {
    setLocalQuantities(() => {
      const next: Record<number, number> = {};
      cartItems.forEach((item) => { next[item.id] = item.quantity; });
      return next;
    });
  }, [cartItems]);

  // Clear selection when flyout closes
  useEffect(() => {
    if (!open) setSelectedIds(new Set());
  }, [open]);

  const getQty = (item: CartItem) => localQuantities[item.id] ?? item.quantity;

  const allInStock = cartItems.filter((i) => (i.product?.stockQuantity ?? 0) > 0);
  const allSelected =
    allInStock.length > 0 && allInStock.every((i) => selectedIds.has(i.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allInStock.map((i) => i.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeQty = async (item: CartItem, delta: number) => {
    const stock = item.product?.stockQuantity ?? 0;
    const current = getQty(item);
    const next = Math.min(Math.max(1, current + delta), stock);
    if (next === current) return;

    setLocalQuantities((prev) => ({ ...prev, [item.id]: next }));
    try {
      await updateQuantity(item, next);
    } catch {
      // Revert optimistic update on failure
      setLocalQuantities((prev) => ({ ...prev, [item.id]: current }));
    }
  };

  // Subtotal: selected items only (0 when nothing selected)
  const relevantItems = cartItems.filter((i) => selectedIds.has(i.id));

  const subtotal = relevantItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * getQty(item),
    0
  );

  const handleCheckout = () => {
    sessionStorage.setItem(
      "checkoutCartItemIds",
      JSON.stringify(Array.from(selectedIds))
    );
    onClose();
    router.push(ROUTES.CHECKOUT);
  };

  return (
    <ResponsiveFlyout open={open} onClose={onClose}>
        {/* ── Header ── */}
        <div className="h-15.5 flex items-center justify-center shrink-0 lg:border-b-[0.5px] border-[#B9B7B7]">
          <div className="relative pb-2">
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:shopping-outline"
                width={20}
                height={20}
                className="text-black"
              />
              <span className="font-inter font-medium text-base leading-none tracking-normal">
                My Cart
              </span>
            </div>
            {/* Underline: extends 10px beyond icon+text on each side */}
            <div className="absolute -bottom-0.5 -left-2.5 -right-2.5 h-0.5 bg-primary" />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 px-6 space-y-5">
          {isLoading ? (
            <p className="text-sm text-gray-500 text-center mt-10">Loading…</p>
          ) : cartItems.length === 0 ? (
            <EmptyState
              icon="iconoir:simple-cart"
              title="Your cart is empty."
              description="Looks like you haven't added anything to your cart yet."
              buttonText="Explore Products"
            />
          ) : (
            <>
              {/* Select All / Deselect All */}
              <div
                className="flex items-center gap-2 pb-3 border-b border-[#e5e5e5] cursor-pointer"
                onClick={toggleSelectAll}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="font-inter text-sm text-gray-600">
                  {allSelected ? "Deselect All" : "Select All"}
                </span>
              </div>

              {/* Cart items */}
              {cartItems.map((item, idx) => {
                const product = item.product;
                const isOOS = !product || product.stockQuantity === 0;
                const primaryImage =
                  product?.images?.find((img) => img.isPrimary)?.imageUrl ??
                  product?.images?.[0]?.imageUrl;
                const stock = product?.stockQuantity ?? 0;
                const qty = getQty(item);
                const isSelected = selectedIds.has(item.id);

                return (
                  <Fragment key={item.id}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox — vertically centered */}
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
                          <span className="font-inter font-semibold text-[12px] text-white leading-none uppercase text-center px-2">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Info: title + stepper */}
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

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1.5 mt-3">
                        <button
                          onClick={() => changeQty(item, -1)}
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
                          onClick={() => changeQty(item, 1)}
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
                            showToast({ icon: "proicons:delete", title: "Removed from Cart!", variant: "negative" });
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
                          Rs.{" "}
                          {((product?.price ?? 0) * qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {idx < cartItems.length - 1 && (
                    <div className="lg:hidden ml-7 border-t border-[#E5E5E5]" />
                  )}
                  </Fragment>
                );
              })}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 pt-4 pb-8 lg:pb-4 border-t-[0.5px] border-[#B9B7B7] space-y-3">
          {/* Total + Shipping rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-montserrat lg:font-inter font-medium text-[14px] lg:text-base leading-none">
                Total
              </span>
              <span className="font-montserrat font-semibold text-[14px] lg:text-base leading-none">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="font-montserrat lg:font-inter font-medium text-[14px] lg:text-base leading-none shrink-0">
                Shipping
              </span>
              <span className="font-montserrat font-light lg:font-normal text-[14px] lg:text-base text-[#434242] leading-none text-right">
                Cost will appear on checkout
              </span>
            </div>
          </div>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={selectedIds.size === 0}
            className="w-full bg-black text-white font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-2 lg:px-2.5 py-0 lg:py-1.5 flex items-center justify-center transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            CHECKOUT
          </button>
        </div>
    </ResponsiveFlyout>
  );
}
