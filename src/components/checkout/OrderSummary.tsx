"use client";

import Image from "next/image";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { CartItem } from "@/types/cart.types";
import { Input } from "@/components/ui/input";

const fmt = (price: number) =>
  `Rs. ${Math.round(price).toLocaleString("en-NP")}`;

interface AppliedDiscount {
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  discountAmount: number;
}

interface Props {
  checkoutItems: CartItem[];
  isGuest?: boolean;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  appliedDiscount: AppliedDiscount | null;
  discountCode: string;
  discountError: string;
  isValidatingDiscount: boolean;
  isCheckingOut: boolean;
  onDiscountCodeChange: (val: string) => void;
  onApplyDiscount: () => void;
  onRemoveDiscount: () => void;
  onCheckout: () => void;
}

export default function OrderSummary({
  checkoutItems,
  isGuest = false,
  subtotal,
  shippingCost,
  discountAmount,
  total,
  appliedDiscount,
  discountCode,
  discountError,
  isValidatingDiscount,
  isCheckingOut,
  onDiscountCodeChange,
  onApplyDiscount,
  onRemoveDiscount,
  onCheckout,
}: Props) {
  return (
    <div className="border border-[#E2E4E5] rounded-lg p-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-montserrat font-semibold text-[18px] lg:text-[20px] leading-none text-black">
          Order Summary
        </h2>
      </div>

      {/* Items */}
      <div className="flex flex-col">
        {checkoutItems.map((item) => {
          const product = item.product;
          if (!product) return null;

          const primaryImg = product.images?.find((img) => img.isPrimary);
          const imageUrl = primaryImg?.imageUrl ?? product.images?.[0]?.imageUrl;
          const price =
            typeof product.price === "string"
              ? parseFloat(product.price as unknown as string)
              : product.price;
          const itemTotal = price * item.quantity;

          return (
            <div
              key={item.id}
              className="flex items-start gap-3.75 lg:gap-6 py-2.5 lg:py-4 border-b border-[#B9B7B7]"
            >
              {/* Image + quantity bubble */}
              <div className="relative shrink-0 w-17.5 h-17.5 lg:w-30 lg:h-30">
                <div className="relative w-full h-full border border-[#E2E4E5] overflow-hidden bg-[#F8F8F8]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                {/* Quantity bubble */}
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                  <span className="font-inter font-normal text-[15px] leading-none text-white">
                    {item.quantity}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.75 pt-1">
                <p className="font-montserrat font-medium text-[14px] lg:text-[16px] leading-tight text-foreground line-clamp-2">
                  {product.name}
                </p>
                {product.brand && (
                  <p className="font-montserrat font-medium text-[12px] lg:text-[16px] leading-none text-[#4B4B4B]">
                    {product.brand.name}
                  </p>
                )}
                <p className="font-montserrat font-medium text-[12px] lg:text-[16px] leading-none text-[#4B4B4B]">
                  Rs. {price.toLocaleString()} × {item.quantity}
                </p>
              </div>

              {/* Item total */}
              <div className="shrink-0 self-center">
                <span className="font-montserrat font-semibold text-[12px] lg:text-[16px] leading-none text-black">
                  Rs. {itemTotal.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discount Code */}
      <div>
        <p className="font-inter font-normal text-[10px] lg:text-[14px] leading-none text-[#4B4B4B] mb-2">
          Discount Code
        </p>

        {appliedDiscount ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">
                Code &ldquo;{appliedDiscount.code}&rdquo; applied
              </p>
              <p className="text-xs text-green-600">
                {appliedDiscount.name}
                {" · "}
                {appliedDiscount.type === "percentage"
                  ? `${appliedDiscount.value}% off`
                  : `Rs. ${appliedDiscount.value} off`}
                {" · "}
                You saved {fmt(appliedDiscount.discountAmount)}
              </p>
            </div>
            <button
              onClick={onRemoveDiscount}
              className="text-xs text-green-600 hover:text-green-700 font-medium shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              id="discountCode"
              value={discountCode}
              onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className={`h-6 lg:h-9 text-[12px] md:text-[12px] lg:text-sm ${discountError ? "border-red-500" : ""}`}
            />
            <button
              onClick={onApplyDiscount}
              disabled={isValidatingDiscount || !discountCode.trim()}
              className="shrink-0 bg-black text-white font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-2 lg:px-2.5 py-0 lg:py-1.5 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
            >
              {isValidatingDiscount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "APPLY CODE"
              )}
            </button>
          </div>
        )}

        {discountError && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {discountError}
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="flex flex-col gap-2.5 pb-4 border-b border-[#B9B7B7]">
        <div className="flex justify-between items-center">
          <span className="font-inter font-medium text-[11px] lg:text-[16px] leading-none text-[#4B4B4B]">
            Sub-Total
          </span>
          <span className="font-inter lg:font-montserrat font-medium lg:font-semibold text-[11px] lg:text-[16px] leading-none text-[#4B4B4B]">
            {fmt(subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-inter font-medium text-[11px] lg:text-[16px] leading-none text-[#4B4B4B]">
            {appliedDiscount ? `Discount (${appliedDiscount.code})` : "Discount"}
          </span>
          <span className="font-inter lg:font-montserrat font-medium lg:font-semibold text-[11px] lg:text-[16px] leading-none text-[#4B4B4B]">
            {appliedDiscount ? `- ${fmt(discountAmount)}` : fmt(0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-inter font-medium text-[11px] lg:text-[16px] leading-none text-[#4B4B4B]">
            Shipping
          </span>
          <span className="font-inter lg:font-montserrat font-medium lg:font-semibold text-[11px] lg:text-[16px] leading-none text-[#4B4B4B]">
            {fmt(shippingCost)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center -mt-2.5">
        <span className="font-inter lg:font-montserrat font-bold text-[12px] lg:text-[20px] leading-none text-black">
          Total
        </span>
        <span className="font-inter lg:font-montserrat font-bold text-[12px] lg:text-[20px] leading-none text-black">
          {fmt(total)}
        </span>
      </div>

      {/* Guest notice — orders placed without an account can't be tracked */}
      {isGuest && (
        <div className="-mt-2.5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-px" />
          <p className="font-inter text-[11px] lg:text-[12px] leading-snug text-amber-800">
            You&apos;re checking out as a guest. You won&apos;t be able to track this
            order or view it in an account.{" "}
            <span className="font-medium">Log in or create an account</span> to keep
            track of your orders.
          </p>
        </div>
      )}

      {/* Place Order */}
      <button
        onClick={onCheckout}
        disabled={isCheckingOut}
        className="-mt-2.5 w-full bg-black text-white font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-2 lg:px-2.5 py-0 lg:py-1.5 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
      >
        {isCheckingOut ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Place Order`
        )}
      </button>

      <p className="text-[11px] text-gray-500 text-center">
        By placing this order, you agree to our Terms &amp; Conditions
      </p>
    </div>
  );
}
