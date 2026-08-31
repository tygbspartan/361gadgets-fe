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
    // Create order (checkout).
    // An optional Idempotency-Key (sent as a header, not in the body) lets a
    // double-click or network retry resolve to the SAME order instead of
    // creating duplicates — the backend returns the original order for a
    // repeated key.
    checkout: builder.mutation<
      CheckoutResponse,
      CheckoutRequest & { idempotencyKey?: string }
    >({
      query: ({ idempotencyKey, ...body }) => ({
        url: "/orders/checkout",
        method: "POST",
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
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
