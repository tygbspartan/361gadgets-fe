import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Vendor,
  VendorDetail,
  CreateVendorDto,
  UpdateVendorDto,
  VendorFilters,
  VendorsApiResponse,
  SingleVendorApiResponse,
} from "@/types/vendor.types";
import {
  EarningsFilters,
  VendorEarningsSummary,
  VendorEarningsSummaryApiResponse,
  VendorEarningsDetail,
  VendorEarningsDetailApiResponse,
} from "@/types/earnings.types";

// All endpoints here are superadmin-only (backend returns 403 otherwise).
export const vendorsApi = createApi({
  reducerPath: "vendorsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Vendors", "Vendor", "VendorEarnings"],
  endpoints: (builder) => ({
    // List vendors (?isActive, ?search)
    getVendors: builder.query<Vendor[], VendorFilters>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.isActive !== undefined)
          searchParams.append("isActive", String(params.isActive));
        if (params.search) searchParams.append("search", params.search);
        const qs = searchParams.toString();
        return `${API_ENDPOINTS.VENDORS}${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: VendorsApiResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((v) => ({ type: "Vendor" as const, id: v.id })),
              { type: "Vendors" as const, id: "LIST" },
            ]
          : [{ type: "Vendors" as const, id: "LIST" }],
    }),

    // Get one vendor (+ owned product/discount counts)
    getVendor: builder.query<VendorDetail, number>({
      query: (id) => API_ENDPOINTS.VENDOR_BY_ID(id),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "Vendor", id }],
    }),

    // Create a vendor (auto email-verified, active)
    createVendor: builder.mutation<VendorDetail, CreateVendorDto>({
      query: (body) => ({
        url: API_ENDPOINTS.VENDORS,
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: [{ type: "Vendors", id: "LIST" }],
    }),

    // Update profile (name, phone)
    updateVendor: builder.mutation<
      VendorDetail,
      { id: number; data: UpdateVendorDto }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.VENDOR_BY_ID(id),
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),

    // Activate / deactivate (deactivate = instant access revocation)
    setVendorStatus: builder.mutation<
      VendorDetail,
      { id: number; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: API_ENDPOINTS.VENDOR_STATUS(id),
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),

    // Upload / replace a vendor's logo (multipart/form-data, field: "logo")
    uploadVendorLogo: builder.mutation<
      VendorDetail,
      { id: number; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: API_ENDPOINTS.VENDOR_LOGO_UPLOAD(id),
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),

    // Delete a vendor's logo
    deleteVendorLogo: builder.mutation<VendorDetail, number>({
      query: (id) => ({
        url: API_ENDPOINTS.VENDOR_LOGO_DELETE(id),
        method: "DELETE",
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: (result, error, id) => [
        { type: "Vendor", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),

    // Per-vendor earnings & payouts owed (optional ?startDate/?endDate)
    getVendorEarnings: builder.query<VendorEarningsSummary, EarningsFilters>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.startDate) searchParams.append("startDate", params.startDate);
        if (params.endDate) searchParams.append("endDate", params.endDate);
        const qs = searchParams.toString();
        return `${API_ENDPOINTS.VENDOR_EARNINGS}${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: VendorEarningsSummaryApiResponse) =>
        response.data,
      providesTags: [{ type: "VendorEarnings", id: "SUMMARY" }],
    }),

    // Order-by-order earnings breakdown for one vendor
    getVendorEarningsDetail: builder.query<
      VendorEarningsDetail,
      { id: number } & EarningsFilters
    >({
      query: ({ id, startDate, endDate }) => {
        const searchParams = new URLSearchParams();
        if (startDate) searchParams.append("startDate", startDate);
        if (endDate) searchParams.append("endDate", endDate);
        const qs = searchParams.toString();
        return `${API_ENDPOINTS.VENDOR_EARNINGS_DETAIL(id)}${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: VendorEarningsDetailApiResponse) =>
        response.data,
      providesTags: (result, error, { id }) => [
        { type: "VendorEarnings", id },
      ],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useSetVendorStatusMutation,
  useUploadVendorLogoMutation,
  useDeleteVendorLogoMutation,
  useGetVendorEarningsQuery,
  useGetVendorEarningsDetailQuery,
} = vendorsApi;
