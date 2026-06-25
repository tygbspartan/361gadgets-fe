// API Response Wrapper
export interface OrdersApiResponse {
  status: string;
  message: string;
  data: {
    data: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SingleOrderApiResponse {
  status: string;
  message: string;
  data: Order;
}

// Order Interface
export interface Order {
  id: number;
  orderNumber: string;
  userId: number;

  // Order Status
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  // Pricing (all as strings to match Decimal from database)
  subtotal: string;
  shippingCost: string;
  tax: string;
  discount: string;
  total: string;

  // Shipping Info
  shippingFullName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingLandmark: string | null;
  shippingCity: string;
  shippingProvince: string | null;
  shippingPostalCode: string;
  shippingCountry: string;

  // Payment
  paymentMethod: "cod" | "esewa" | "khalti" | "bank_transfer";
  paymentStatus: "pending" | "paid" | "failed";
  transactionNumber: string | null;

  // Discount
  discountId: number | null;
  discountCode: string | null;

  // Notes
  customerNote: string | null;
  adminNote: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  items: OrderItem[];
}

// Order Item Interface
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;

  // Product Snapshot
  productName: string;
  productSku: string | null;
  productImage: string | null;

  // Pricing (strings to match Decimal)
  price: string;
  quantity: number;
  subtotal: string;

  createdAt: string;

  // Relations (optional)
  product?: {
    id: number;
    name: string;
    slug: string;
    brand?: {
      id: number;
      name: string;
    };
  };
}

// DTOs for Creating/Updating Orders

export interface CreateOrderDto {
  userId: number;

  // Pricing
  subtotal: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  total: number;

  // Shipping Info
  shippingFullName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingLandmark?: string;
  shippingCity: string;
  shippingProvince?: string;
  shippingPostalCode: string;
  shippingCountry?: string;

  // Payment
  paymentMethod: string;
  transactionNumber?: string;

  // Discount
  discountId?: number;
  discountCode?: string;

  // Notes
  customerNote?: string;

  // Items
  items: {
    productId: number;
    productName: string;
    productSku?: string;
    productImage?: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

export interface UpdateOrderStatusDto {
  status: Order["status"];
  adminNote?: string;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: Order["paymentStatus"];
  transactionNumber?: string;
}

// Helper types for filters
export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: Order["status"] | "";
  paymentStatus?: Order["paymentStatus"] | "";
  search?: string;
}
