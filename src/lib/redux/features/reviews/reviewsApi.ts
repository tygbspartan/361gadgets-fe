import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import {
  Review,
  CreateReviewDto,
  CreateFollowupDto,
  UpdateReviewCustomerDto,
  UpdateReviewDto,
  ProductReviewsResponse,
  ReviewsApiResponse,
  SingleReviewApiResponse,
  ReviewFilters,
} from "@/types/review.types";

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Reviews", "Review", "ProductReviews", "MyReviews"],
  endpoints: (builder) => ({
    // ========== ADMIN ENDPOINTS (Already exist) ==========

    // Get all reviews (Admin)
    getReviews: builder.query<ReviewsApiResponse["data"], ReviewFilters>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.isApproved !== undefined)
          searchParams.append("isApproved", params.isApproved.toString());
        if (params.rating)
          searchParams.append("rating", params.rating.toString());
        if (params.productId)
          searchParams.append("productId", params.productId.toString());

        return `/reviews/admin/all?${searchParams.toString()}`;
      },
      transformResponse: (response: ReviewsApiResponse) => response.data,
      providesTags: ["Reviews"],
    }),

    // Get single review (Admin)
    getReview: builder.query<Review, number>({
      query: (id) => `/reviews/admin/${id}`,
      transformResponse: (response: SingleReviewApiResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),

    // Update review (Admin - approve/reject, add notes)
    updateReview: builder.mutation<
      Review,
      { id: number; data: UpdateReviewDto }
    >({
      query: ({ id, data }) => ({
        url: `/reviews/${id}/moderate`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: SingleReviewApiResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        "Reviews",
        { type: "Review", id },
      ],
    }),

    // Delete review (Admin)
    deleteReview: builder.mutation<void, number>({
      query: (id) => ({
        url: `/reviews/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"],
    }),

    // ========== CUSTOMER ENDPOINTS (New) ==========

    // Get reviews for a product (Public)
    getProductReviews: builder.query<
      ProductReviewsResponse["data"],
      { productId: number; rating?: number }
    >({
      query: ({ productId, rating }) => {
        const searchParams = new URLSearchParams();
        if (rating) searchParams.append("rating", rating.toString());
        return `/reviews/product/${productId}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      },
      transformResponse: (response: ProductReviewsResponse) => response.data,
      providesTags: (result, error, { productId }) => [
        { type: "ProductReviews", id: productId },
      ],
    }),

    // Create review (Customer)
    createReview: builder.mutation<Review, CreateReviewDto>({
      query: (data) => ({
        url: "/reviews",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: SingleReviewApiResponse) => response.data,
      invalidatesTags: (result, error, { productId }) => [
        "MyReviews",
        { type: "ProductReviews", id: productId },
      ],
    }),

    // Create follow-up review (Customer)
    createFollowup: builder.mutation<Review, { initialReviewId: number; data: CreateFollowupDto }>({
      query: ({ initialReviewId, data }) => ({
        url: `/reviews/${initialReviewId}/followup`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: SingleReviewApiResponse) => response.data,
      invalidatesTags: ["MyReviews"],
    }),

    // Get user's own reviews (Customer)
    getMyReviews: builder.query<Review[], void>({
      query: () => "/reviews/my-reviews",
      transformResponse: (response: {
        status: string;
        message: string;
        data: Review[];
      }) => response.data,
      providesTags: ["MyReviews"],
    }),

    // Update own review (Customer)
    updateMyReview: builder.mutation<
      Review,
      { id: number; data: UpdateReviewCustomerDto }
    >({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: SingleReviewApiResponse) => response.data,
      invalidatesTags: (result) => [
        "MyReviews",
        { type: "ProductReviews", id: result?.productId },
      ],
    }),

    // Delete own review (Customer)
    deleteMyReview: builder.mutation<void, { id: number; productId: number }>({
      query: ({ id }) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { productId }) => [
        "MyReviews",
        { type: "ProductReviews", id: productId },
      ],
    }),

    // Mark review as helpful (Customer)
    markReviewHelpful: builder.mutation<void, number>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/helpful`,
        method: "POST",
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: "Review", id: reviewId },
      ],
    }),

    // Remove helpful vote (Customer)
    removeReviewHelpful: builder.mutation<void, number>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/helpful`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: "Review", id: reviewId },
      ],
    }),
  }),
});

export const {
  // Admin hooks
  useGetReviewsQuery,
  useGetReviewQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,

  // Customer hooks
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useCreateFollowupMutation,
  useGetMyReviewsQuery,
  useUpdateMyReviewMutation,
  useDeleteMyReviewMutation,
  useMarkReviewHelpfulMutation,
  useRemoveReviewHelpfulMutation,
} = reviewsApi;
