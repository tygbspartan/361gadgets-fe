import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  seoDescription: string | null;
  /** Vendor this brand is reserved for. null = unclaimed. */
  ownerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandOwner {
  id: number;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
}

/** A brand as returned by the scoped admin list — includes owner + product count. */
export interface AdminBrand extends Brand {
  owner: BrandOwner | null;
  productCount: number;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateBrandRequest {
  name?: string;
  description?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  seoDescription?: string;
}

export const brandsApi = createApi({
  reducerPath: "brandsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Brands"],
  endpoints: (builder) => ({
    // Get all brands
    getBrands: builder.query<{ status: string; data: Brand[] }, void>({
      query: () => "/brands",
      providesTags: ["Brands"],
    }),

    // Scoped admin brand list: vendor = own brands; superadmin = all (optionally
    // filtered by ownerId, or "null" for unassigned). Includes owner + count.
    getAdminBrands: builder.query<
      { status: string; data: AdminBrand[] },
      { ownerId?: number | "null" } | void
    >({
      query: (arg) => {
        const ownerId = arg && "ownerId" in arg ? arg.ownerId : undefined;
        return ownerId !== undefined
          ? `/brands/admin/list?ownerId=${ownerId}`
          : "/brands/admin/list";
      },
      providesTags: ["Brands"],
    }),

    // Get brand by ID
    getBrandById: builder.query<{ status: string; data: Brand }, number>({
      query: (id) => `/brands/${id}`,
      providesTags: (result, error, id) => [{ type: "Brands", id }],
    }),

    // Create brand
    createBrand: builder.mutation<
      { status: string; data: Brand },
      CreateBrandRequest
    >({
      query: (brand) => ({
        url: "/brands",
        method: "POST",
        body: brand,
      }),
      invalidatesTags: ["Brands"],
    }),

    // Update brand
    updateBrand: builder.mutation<
      { status: string; data: Brand },
      { id: number; brand: UpdateBrandRequest }
    >({
      query: ({ id, brand }) => ({
        url: `/brands/${id}`,
        method: "PUT",
        body: brand,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Brands", id },
        "Brands",
      ],
    }),

    // Delete brand
    deleteBrand: builder.mutation<{ status: string; data: null }, number>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brands"],
    }),

    // Upload brand logo (multipart/form-data, field: "logo")
    uploadBrandLogo: builder.mutation<
      { status: string; data: Brand },
      { id: number; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/brands/${id}/logo/upload`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Brands", id }, "Brands"],
    }),

    // Delete brand logo
    deleteBrandLogo: builder.mutation<{ status: string; data: Brand }, number>({
      query: (id) => ({
        url: `/brands/${id}/logo`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Brands", id }, "Brands"],
    }),

    // Set the exact set of brands a vendor owns (superadmin). Assigns/reassigns
    // the given brands to the vendor and releases the rest.
    assignBrandsToVendor: builder.mutation<
      { status: string; message: string },
      { vendorId: number; brandIds: number[] }
    >({
      query: ({ vendorId, brandIds }) => ({
        url: `/admin/vendors/${vendorId}/brands`,
        method: "PUT",
        body: { brandIds },
      }),
      invalidatesTags: ["Brands"],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetAdminBrandsQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useUploadBrandLogoMutation,
  useDeleteBrandLogoMutation,
  useAssignBrandsToVendorMutation,
} = brandsApi;
