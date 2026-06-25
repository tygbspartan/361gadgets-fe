import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import {
  CartItem,
  CartApiResponse,
  AddToCartRequest,
  UpdateCartRequest,
} from "@/types/cart.types";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // Get user's cart - UPDATED
    getCart: builder.query<CartItem[], void>({
      query: () => "/cart",
      transformResponse: (response: CartApiResponse) => response.data.items, // ← CHANGED
      providesTags: ["Cart"],
    }),

    // Add item to cart - UPDATED
    addToCart: builder.mutation<CartApiResponse, AddToCartRequest>({
      query: (body) => ({
        url: "/cart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Update cart item quantity - UPDATED
    updateCartItem: builder.mutation<
      CartApiResponse,
      { id: number; data: UpdateCartRequest }
    >({
      query: ({ id, data }) => ({
        url: `/cart/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Remove item from cart - UPDATED
    removeFromCart: builder.mutation<CartApiResponse, number>({
      query: (id) => ({
        url: `/cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Clear entire cart - UPDATED
    clearCart: builder.mutation<CartApiResponse, void>({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
