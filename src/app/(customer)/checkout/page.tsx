"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { RootState } from "@/lib/redux/store";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { removeGuestCartItems } from "@/lib/redux/features/cart/guestCartSlice";
import {
  useCheckoutMutation,
  useValidateDiscountMutation,
} from "@/lib/redux/features/checkout/checkoutApi";
import { ShippingInfo } from "@/types/checkout.types";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/components/ui/ToastStack";
import { KATHMANDU_VALLEY_CITIES, SHIPPING_COSTS } from "@/constants/checkout";
import OrderSummary from "@/components/checkout/OrderSummary";
import ShippingDetails from "@/components/checkout/ShippingDetails";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const { items: cartItems, isLoading: cartLoading, isGuest } = useCart();

  const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation();
  const { showToast } = useToast();
  const [validateDiscount, { isLoading: isValidatingDiscount }] = useValidateDiscountMutation();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    email: user?.email || "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qr">("cod");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cartItemIds, setCartItemIds] = useState<number[] | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutCartItemIds");
    if (stored) {
      try { setCartItemIds(JSON.parse(stored)); } catch { setCartItemIds(null); }
      sessionStorage.removeItem("checkoutCartItemIds");
    }
  }, []);

  useEffect(() => {
    if (user?.email) setShippingInfo((prev) => ({ ...prev, email: user.email }));
  }, [user]);

  const checkoutItems =
    cartItemIds && cartItemIds.length > 0
      ? cartItems.filter((i) => cartItemIds.includes(i.id))
      : cartItems;

  const subtotal = checkoutItems.reduce((sum, item) => {
    const price =
      typeof item.product?.price === "string"
        ? parseFloat(item.product.price)
        : item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingCost = (() => {
    const city = shippingInfo.city.toLowerCase().trim();
    const inValley = KATHMANDU_VALLEY_CITIES.some(
      (c) => city.includes(c) || c.includes(city)
    );
    return inValley ? SHIPPING_COSTS.INSIDE_VALLEY : SHIPPING_COSTS.OUTSIDE_VALLEY;
  })();

  const discountAmount = appliedDiscount?.discountAmount ?? 0;
  const total = subtotal + shippingCost - discountAmount;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) { setDiscountError("Please enter a discount code"); return; }
    setDiscountError("");
    try {
      const result = await validateDiscount({ code: discountCode, cartSubtotal: subtotal }).unwrap();
      if (result.data.valid && result.data.discount) {
        setAppliedDiscount(result.data.discount);
      } else {
        setDiscountError("Invalid or expired discount code");
        setAppliedDiscount(null);
      }
    } catch (error: any) {
      setDiscountError(error?.data?.message || "Failed to validate discount code");
      setAppliedDiscount(null);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!shippingInfo.fullName.trim()) errors.fullName = "Full name is required";
    if (!shippingInfo.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^98\d{8}$/.test(shippingInfo.phone.trim()))
      errors.phone = "Invalid phone number (10 digits starting with 98)";
    if (!shippingInfo.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email))
      errors.email = "Invalid email address";
    if (!shippingInfo.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!shippingInfo.landmark.trim()) errors.landmark = "Landmark is required";
    if (!shippingInfo.city.trim()) errors.city = "City is required";
    if (!shippingInfo.province) errors.province = "Province is required";
    if (!shippingInfo.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (paymentMethod === "qr" && !transactionNumber.trim())
      errors.transactionNumber = "Transaction number is required for QR payment";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async () => {
    for (const item of checkoutItems) {
      if (!item.product) continue;
      if (item.product.stockQuantity === 0) { alert(`${item.product.name} is out of stock`); return; }
      if (item.quantity > item.product.stockQuantity) {
        alert(`Only ${item.product.stockQuantity} units of ${item.product.name} available`);
        return;
      }
    }
    if (!checkoutItems.length) return;
    if (!validateForm()) { alert("Please fill in all required fields correctly"); return; }

    try {
      const result = await checkout({
        shippingInfo,
        paymentMethod,
        transactionNumber: paymentMethod === "qr" ? transactionNumber : undefined,
        customerNote: customerNote.trim() || undefined,
        discountCode: appliedDiscount?.code || undefined,
        // Authenticated: server reads the cart by ids. Guest: send line items.
        cartItemIds:
          !isGuest && cartItemIds && cartItemIds.length > 0 ? cartItemIds : undefined,
        items: isGuest
          ? checkoutItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
          : undefined,
      }).unwrap();

      // Guest cart lives client-side, so clear the items we just ordered.
      if (isGuest) {
        dispatch(removeGuestCartItems(checkoutItems.map((i) => i.id)));
      }

      showToast({
        icon: "hugeicons:delivery-sent-01",
        title: "Order Placed!",
        description: "Thank you for your order. We'll start processing shortly.",
        variant: "positive",
      });
      const email = encodeURIComponent(shippingInfo.email);
      router.push(
        `/order-confirmation/${result.data.orderNumber}${isGuest ? `?email=${email}` : ""}`
      );
    } catch (error: any) {
      alert(error?.data?.message || "Failed to place order. Please try again.");
    }
  };

  if (cartLoading) {
    return (
      <div className="page-wrapper pb-16 text-center">
        <Loader2 className="h-12 w-12 mx-auto animate-spin" />
        <p className="mt-4 text-gray-600">Loading…</p>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="page-wrapper pb-16 text-center">
        <h1 className="font-montserrat font-semibold text-2xl mb-4">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mb-6">Add some products to checkout</p>
        <Link
          href={ROUTES.PRODUCTS}
          className="bg-black text-white font-inter font-medium text-sm px-6 py-3 rounded-[3px] hover:opacity-80 transition-opacity"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 lg:mt-6 items-start">
        {/* Order Summary — 40% */}
        <div className="w-full lg:w-[40%] lg:sticky lg:top-6">
          <OrderSummary
            checkoutItems={checkoutItems}
            isGuest={isGuest}
            subtotal={subtotal}
            shippingCost={shippingCost}
            discountAmount={discountAmount}
            total={total}
            appliedDiscount={appliedDiscount}
            discountCode={discountCode}
            discountError={discountError}
            isValidatingDiscount={isValidatingDiscount}
            isCheckingOut={isCheckingOut}
            onDiscountCodeChange={setDiscountCode}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Shipping Details — 60% */}
        <div className="w-full lg:w-[60%]">
          <ShippingDetails
            shippingInfo={shippingInfo}
            onShippingChange={setShippingInfo}
            formErrors={formErrors}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            transactionNumber={transactionNumber}
            onTransactionNumberChange={setTransactionNumber}
            customerNote={customerNote}
            onCustomerNoteChange={setCustomerNote}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
