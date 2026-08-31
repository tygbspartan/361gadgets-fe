import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import { API_ENDPOINTS } from "@/constants/api";

export interface CatalogRequestDto {
  type: "brand" | "category";
  name: string;
  note?: string;
  parentName?: string;
}

export const catalogRequestApi = createApi({
  reducerPath: "catalogRequestApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // Vendors request a new brand/category — emails the platform admin.
    createCatalogRequest: builder.mutation<
      { status: string; message: string },
      CatalogRequestDto
    >({
      query: (body) => ({
        url: API_ENDPOINTS.CATALOG_REQUESTS,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateCatalogRequestMutation } = catalogRequestApi;
