export interface Review {
  id: number;
  productId: number;
  userId: number;
  orderId: number | null;

  rating: number; // 1-5
  title: string | null;
  comment: string;

  images: string | null; // JSON array of URLs

  isVerifiedPurchase: boolean;
  isApproved: boolean;
  adminNote: string | null;

  helpfulCount: number;

  reviewType: "initial" | "followup";
  parentReviewId: number | null;

  createdAt: string;
  updatedAt: string;

  // Relations
  product?: {
    id: number;
    name: string;
    slug: string;
    brand?: { id: number; name: string };
    images?: Array<{ id: number; imageUrl: string; isPrimary: boolean; altText: string | null }>;
  };
  user?: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  order?: {
    id: number;
    orderNumber: string;
  };
  followupReview?: Review | null;
}

// ← ADD THESE CUSTOMER DTOs
export interface CreateReviewDto {
  productId: number;
  orderId?: number;
  rating: number;
  title?: string;
  comment: string;
  images?: string[]; // Array of image URLs
}

export interface UpdateReviewCustomerDto {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface CreateFollowupDto {
  comment: string;
  rating?: number;
  title?: string;
}

export interface ProductReviewsResponse {
  status: string;
  message: string;
  data: {
    reviews: Review[];
    summary: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
  };
}

// Admin DTOs (already exist)
export interface UpdateReviewDto {
  isApproved?: boolean;
  adminNote?: string;
}

export interface ReviewsApiResponse {
  status: string;
  message: string;
  data: {
    data: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SingleReviewApiResponse {
  status: string;
  message: string;
  data: Review;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  search?: string;
  isApproved?: boolean;
  rating?: number;
  productId?: number;
}
