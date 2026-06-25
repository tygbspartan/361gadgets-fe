import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import {
  CheckoutRequest,
  CheckoutResponse,
  DiscountValidationRequest,
  DiscountValidationResponse,
} from "@/types/checkout.types";

export const checkoutApi = createApi({
  reducerPath: "checkoutApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // Create order (checkout)
    checkout: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: "/orders/checkout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate cart to force refetch and update cart count
          dispatch({ type: "cartApi/invalidateTags", payload: ["Cart"] });
        } catch {}
      },
    }),

    // Validate discount code - NO SUBTOTAL NEEDED
    validateDiscount: builder.mutation<
      DiscountValidationResponse,
      DiscountValidationRequest
    >({
      query: (body) => ({
        url: "/discounts/validate",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCheckoutMutation, useValidateDiscountMutation } = checkoutApi;
