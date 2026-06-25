import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import {
  Discount,
  CreateDiscountDto,
  UpdateDiscountDto,
  DiscountsApiResponse,
  SingleDiscountApiResponse,
} from "@/types/discount.types";

export const discountsApi = createApi({
  reducerPath: "discountsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Discounts", "Discount"],
  endpoints: (builder) => ({
    // Get all discounts
    getDiscounts: builder.query<
      DiscountsApiResponse["data"],
      {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.isActive !== undefined)
          searchParams.append("isActive", params.isActive.toString());

        return `/discounts?${searchParams.toString()}`;
      },
      providesTags: ["Discounts"],
    }),

    // Get single discount
    getDiscount: builder.query<Discount, number>({
      query: (id) => `/discounts/${id}`,
      transformResponse: (response: SingleDiscountApiResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "Discount", id }],
    }),

    // Create discount
    createDiscount: builder.mutation<Discount, CreateDiscountDto>({
      query: (discountData) => ({
        url: "/discounts",
        method: "POST",
        body: discountData,
      }),
      transformResponse: (response: SingleDiscountApiResponse) => response.data,
      invalidatesTags: ["Discounts"],
    }),

    // Update discount
    updateDiscount: builder.mutation<
      Discount,
      { id: number; data: UpdateDiscountDto }
    >({
      query: ({ id, data }) => ({
        url: `/discounts/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: SingleDiscountApiResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        "Discounts",
        { type: "Discount", id },
      ],
    }),

    // Delete discount
    deleteDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/discounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Discounts"],
    }),
  }),
});

export const {
  useGetDiscountsQuery,
  useGetDiscountQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = discountsApi;
