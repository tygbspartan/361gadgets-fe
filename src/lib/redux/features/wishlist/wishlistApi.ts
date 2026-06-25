import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import {
  WishlistItem,
  WishlistApiResponse,
  AddToWishlistRequest,
  MoveToCartRequest,
  MoveToCartResponse,
  BulkMoveToCartRequest,
  BulkMoveToCartResponse,
} from "@/types/wishlist.types";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    // Get user's wishlist
    getWishlist: builder.query<WishlistItem[], void>({
      query: () => "/wishlist",
      transformResponse: (response: WishlistApiResponse) => response.data,
      providesTags: ["Wishlist"],
    }),

    // Add item to wishlist
    addToWishlist: builder.mutation<WishlistApiResponse, AddToWishlistRequest>({
      query: (body) => ({
        url: "/wishlist",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Remove item from wishlist
    removeFromWishlist: builder.mutation<WishlistApiResponse, number>({
      query: (id) => ({
        url: `/wishlist/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Move to cart - UPDATED to accept quantity
    moveToCart: builder.mutation<
      MoveToCartResponse,
      { id: number; quantity: number }
    >({
      query: ({ id, quantity }) => ({
        url: `/wishlist/${id}/move-to-cart`,
        method: "POST",
        body: { quantity }, // ← SEND QUANTITY IN BODY
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Bulk move multiple wishlist items to cart
    bulkMoveToCart: builder.mutation<BulkMoveToCartResponse, BulkMoveToCartRequest>({
      query: (body) => ({
        url: "/wishlist/move-to-cart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Clear entire wishlist
    clearWishlist: builder.mutation<WishlistApiResponse, void>({
      query: () => ({
        url: "/wishlist",
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useMoveToCartMutation,
  useBulkMoveToCartMutation,
  useClearWishlistMutation,
} = wishlistApi;
