export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    stockQuantity: number;
    lowStockThreshold: number;
    images?: Array<{
      id: number;
      imageUrl: string;
      altText: string | null;
      isPrimary: boolean;
    }>;
    brand?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

// ← UPDATE THIS
export interface CartApiResponse {
  status: string;
  message: string;
  data: {
    items: CartItem[];
    summary: {
      totalItems: number;
      subtotal: number;
      estimatedTotal: number;
    };
  };
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
}
