export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    price: string;
    originalPrice: string | null;
    stockQuantity: number;
    lowStockThreshold: number;
    shortDescription: string | null;
    stockStatus?: string;
    images?: Array<{
      id: number;
      productId: number;
      imageUrl: string;
      altText: string | null;
      isPrimary: boolean;
      displayOrder: number;
    }>;
    brand?: {
      id: number;
      name: string;
      slug: string;
    };
    category?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface WishlistApiResponse {
  status: string;
  message: string;
  data: WishlistItem[];
}

export interface AddToWishlistRequest {
  productId: number;
}

export interface MoveToCartRequest {
  quantity: number;
}

export interface MoveToCartResponse {
  status: string;
  message: string;
  data: any;
}

export interface BulkMoveToCartItem {
  wishlistItemId: number;
  quantity: number;
}

export interface BulkMoveToCartRequest {
  items: BulkMoveToCartItem[];
}

export interface BulkMoveToCartResponse {
  status: string;
  message: string;
  data: {
    movedCount: number;
    failedCount: number;
    failedItems?: Array<{ wishlistItemId: number; reason: string }>;
  };
}
