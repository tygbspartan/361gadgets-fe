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

  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountDto {
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;

  minPurchaseAmount?: number;
  maxDiscountAmount?: number;

  startDate: string;
  endDate: string;
  isActive?: boolean;

  usageLimit?: number;
}

export interface UpdateDiscountDto extends Partial<CreateDiscountDto> {}

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
