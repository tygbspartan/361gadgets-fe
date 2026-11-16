import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import { cartApi } from "../cart/cartApi";

/*
 * Moving to cart changes the cart too, but the cart lives in a separate API
 * slice (cartApi), so "Wishlist" invalidation alone leaves the cart count and
 * flyout stale. Refresh it once the request settles (also on failure, since a
 * bulk move can partly succeed).
 */
async function refreshCart(
  { dispatch, queryFulfilled }: { dispatch: (action: unknown) => unknown; queryFulfilled: Promise<unknown> }
) {
  try {
    await queryFulfilled;
  } catch {
    // fall through: the server may still have moved some items
  } finally {
    dispatch(cartApi.util.invalidateTags(["Cart"]));
  }
}
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
      onQueryStarted: (_arg, api) => refreshCart(api),
    }),

    // Bulk move multiple wishlist items to cart
    bulkMoveToCart: builder.mutation<BulkMoveToCartResponse, BulkMoveToCartRequest>({
      query: (body) => ({
        url: "/wishlist/move-to-cart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
      onQueryStarted: (_arg, api) => refreshCart(api),
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
