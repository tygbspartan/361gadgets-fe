export interface Discount {
  id: number;
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: string; // Decimal as string

  minPurchaseAmount: string | null;
  maxDiscountAmount: string | null;

  startDate: string;
  endDate: string;
  isActive: boolean;

  usageLimit: number | null;
  usedCount: number;
  // Each customer (logged in) may use the code only once.
  oncePerUser: boolean;

  // Products the code is limited to (empty = all eligible products).
  products?: { product: { id: number; name: string } }[];

  // Ownership — the vendor (admin) who created this promo. Null = platform-wide (superadmin).
  ownerId: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountDto {
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;

  // null clears a previously set limit (edit form).
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;

  startDate: string;
  endDate: string;
  isActive?: boolean;
  oncePerUser?: boolean;
  // Replaces the product links when sent.
  productIds?: number[];

  usageLimit?: number | null;
}

export type UpdateDiscountDto = Partial<CreateDiscountDto>;

export interface DiscountsApiResponse {
  status: string;
  message: string;
  data: {
    data: Discount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SingleDiscountApiResponse {
  status: string;
  message: string;
  data: Discount;
}
