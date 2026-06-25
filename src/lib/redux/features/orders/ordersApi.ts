import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import {
  Order,
  OrdersApiResponse,
  SingleOrderApiResponse,
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  OrderFilters,
} from "@/types/order.types";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Orders", "Order"],
  endpoints: (builder) => ({
    // ========== ADMIN ENDPOINTS ==========

    // Get all orders (Admin)
    getOrders: builder.query<OrdersApiResponse["data"], OrderFilters>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.status) searchParams.append("status", params.status);
        if (params.paymentStatus)
          searchParams.append("paymentStatus", params.paymentStatus);
        if (params.search) searchParams.append("search", params.search);

        return `/orders/admin/all?${searchParams.toString()}`;
      },
      transformResponse: (response: OrdersApiResponse) => response.data,
      providesTags: ["Orders"],
    }),

    // Get single order by ID (Admin)
    getOrder: builder.query<Order, number>({
      query: (id) => `/orders/admin/${id}`,
      transformResponse: (response: SingleOrderApiResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Update order status (Admin)
    updateOrderStatus: builder.mutation<
      Order,
      { id: number; data: UpdateOrderStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/orders/admin/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Orders",
        { type: "Order", id },
      ],
    }),

    // Update payment status (Admin)
    updatePaymentStatus: builder.mutation<
      Order,
      { id: number; data: UpdatePaymentStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/orders/admin/${id}/payment`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Orders",
        { type: "Order", id },
      ],
    }),

    // Delete order (Admin - for testing/errors only)
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/orders/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),

    // ========== CUSTOMER ENDPOINTS ==========

    // Get user's orders with filters (Customer)
    getUserOrders: builder.query<
      { orders: Order[]; pagination: OrdersApiResponse["data"]["pagination"] },
      { page?: number; limit?: number; status?: string; search?: string }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        searchParams.append("page", (params.page || 1).toString());
        searchParams.append("limit", (params.limit || 10).toString());
        if (params.status) searchParams.append("status", params.status);
        if (params.search) searchParams.append("search", params.search);
        return `/orders?${searchParams.toString()}`;
      },
      transformResponse: (response: OrdersApiResponse) => ({
        orders: response.data.data,
        pagination: response.data.pagination,
      }),
      providesTags: ["Orders"],
    }),

    // Get single order by order number (Customer)
    getOrderByNumber: builder.query<Order, string>({
      query: (orderNumber) => `/orders/${orderNumber}`,
      transformResponse: (response: SingleOrderApiResponse) => response.data,
      providesTags: (result) =>
        result ? [{ type: "Order", id: result.id }] : [],
    }),

    // Create order (Customer)
    createOrder: builder.mutation<Order, CreateOrderDto>({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  // Admin hooks
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useDeleteOrderMutation,

  // Customer hooks
  useGetUserOrdersQuery,
  useGetOrderByNumberQuery,
  useCreateOrderMutation,
} = ordersApi;
