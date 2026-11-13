export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface CheckoutRequest {
  shippingInfo: ShippingInfo;
  paymentMethod: "cod" | "esewa";
  transactionNumber?: string;
  customerNote?: string;
  discountCode?: string;
  cartItemIds?: number[];
  // Guest checkout: line items sent directly (no server-side cart). Ignored
  // by the backend when the request is authenticated.
  items?: { productId: number; quantity: number }[];
}

// ← UPDATED: Order directly in data, not nested
export interface CheckoutResponse {
  status: string;
  message: string;
  data: {
    id: number;
    orderNumber: string;
    userId: number;
    status: string;
    subtotal: string;
    shippingCost: string;
    tax: string;
    discount: string;
    total: string;
    shippingFullName: string;
    shippingPhone: string;
    shippingEmail: string;
    shippingAddressLine1: string;
    shippingAddressLine2: string | null;
    shippingLandmark: string;
    shippingCity: string;
    shippingProvince: string;
    shippingPostalCode: string;
    shippingCountry: string;
    paymentMethod: string;
    paymentStatus: string;
    transactionNumber: string | null;
    discountId: number | null;
    discountCode: string | null;
    customerNote: string | null;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
    items: Array<{
      id: number;
      orderId: number;
      productId: number;
      productName: string;
      productSku: string | null;
      productImage: string | null;
      price: string;
      quantity: number;
      subtotal: string;
      createdAt: string;
    }>;
    appliedDiscount: any;
  };
}

export interface DiscountValidationRequest {
  code: string;
  // The server prices these itself and works out which ones the code covers
  // (a vendor's code only applies to that vendor's products).
  items: { productId: number; quantity: number }[];
}

export interface DiscountValidationResponse {
  status: string;
  message: string;
  data: {
    valid: boolean;
    // Why the code can't be applied, when valid is false.
    message?: string;
    discount?: {
      id: number;
      name: string;
      code: string;
      type: "percentage" | "fixed";
      value: number;
      discountAmount: number;
      // Subtotal of the items the code applies to (less than the cart
      // subtotal when it only covers some of them).
      eligibleSubtotal: number;
    };
  };
}
