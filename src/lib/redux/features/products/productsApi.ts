"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api";
import { Product, CreateProductRequest, ProductImage } from "@/types/product.types";
import { baseQueryWithAuth } from "../../baseQuery";

interface ProductsResponse {
  status: string;
  message: string;
  data: {
    data: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface SingleProductResponse {
  status: string;
  message: string;
  data: Product;
}

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query<
      ProductsResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: number;
        categorySlug?: string;
        brandId?: number;
        brandSlug?: string;
        isActive?: boolean;
        isFeatured?: boolean;
        hasDiscount?: boolean;
        homepageFeature?: boolean;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        skinType?: string;
        skinConcern?: string;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.categoryId)
          searchParams.append("categoryId", params.categoryId.toString());
        if (params.categorySlug)
          searchParams.append("categorySlug", params.categorySlug);
        if (params.brandId)
          searchParams.append("brandId", params.brandId.toString());
        if (params.brandSlug)
          searchParams.append("brandSlug", params.brandSlug);
        if (params.isActive !== undefined)
          searchParams.append("isActive", params.isActive.toString());
        if (params.isFeatured !== undefined)
          searchParams.append("isFeatured", params.isFeatured.toString());
        if (params.hasDiscount !== undefined)
          searchParams.append("hasDiscount", params.hasDiscount.toString());
        if (params.homepageFeature !== undefined)
          searchParams.append("homepageFeature", params.homepageFeature.toString());
        if (params.minPrice)
          searchParams.append("minPrice", params.minPrice.toString());
        if (params.maxPrice)
          searchParams.append("maxPrice", params.maxPrice.toString());
        if (params.sortBy) searchParams.append("sortBy", params.sortBy);
        if (params.sortOrder)
          searchParams.append("sortOrder", params.sortOrder);
        if (params.skinType)
          searchParams.append("skinType", params.skinType);
        if (params.skinConcern)
          searchParams.append("skinConcern", params.skinConcern);

        return `${API_ENDPOINTS.PRODUCTS}?${searchParams.toString()}`;
      },
      providesTags: ["Products"],
    }),

    getFeaturedProducts: builder.query<Product[], void>({
      query: () => "/products?isFeatured=true",
      transformResponse: (response: ProductsResponse) => response.data.data,
      providesTags: ["Products"],
    }),

    getNewArrivals: builder.query<Product[], number | void>({
      query: (limit = 10) =>
        `/products?limit=${limit}&sort=createdAt&order=desc`,
      transformResponse: (response: ProductsResponse) => response.data.data,
      providesTags: ["Products"],
    }),

    getSpecialOffers: builder.query<Product[], number | void>({
      query: (limit = 10) => `/products/discounted?limit=${limit}`,
      transformResponse: (response: ProductsResponse) => response.data.data,
      providesTags: ["Products"],
    }),

    // Get single product
    getProductById: builder.query<SingleProductResponse, number>({
      query: (id) => API_ENDPOINTS.PRODUCT_BY_ID(id),
      providesTags: ["Products"],
    }),

    getProductBySlug: builder.query<SingleProductResponse, string>({
      query: (slug) => API_ENDPOINTS.PRODUCT_BY_SLUG(slug),
      providesTags: ["Products"],
    }),

    getRelatedProducts: builder.query<
      Product[],
      { categoryId: number; currentProductId: number; limit?: number }
    >({
      query: ({ categoryId, currentProductId, limit = 8 }) => {
        const searchParams = new URLSearchParams();
        searchParams.append("categoryId", categoryId.toString());
        searchParams.append("limit", limit.toString());
        searchParams.append("isActive", "true");
        return `/products?${searchParams.toString()}`;
      },
      transformResponse: (response: ProductsResponse, meta, arg) => {
        // Filter out the current product and return only the specified limit
        return response.data.data
          .filter((product) => product.id !== arg.currentProductId)
          .slice(0, arg.limit || 8);
      },
      providesTags: ["Products"],
    }),

    searchProducts: builder.query<Product[], { query: string; limit?: number }>({
      query: ({ query, limit = 6 }) => {
        const searchParams = new URLSearchParams();
        searchParams.append('search', query);
        searchParams.append('limit', limit.toString());
        searchParams.append('isActive', 'true');
        return `/products?${searchParams.toString()}`;
      },
      transformResponse: (response: ProductsResponse) => response.data.data,
      providesTags: ['Products'],
    }),

    // Create product
    createProduct: builder.mutation<
      SingleProductResponse,
      CreateProductRequest
    >({
      query: (product) => ({
        url: API_ENDPOINTS.PRODUCTS,
        method: "POST",
        body: product,
      }),
      invalidatesTags: ["Products"],
    }),

    // Update product
    updateProduct: builder.mutation<
      SingleProductResponse,
      { id: number; product: Partial<CreateProductRequest> }
    >({
      query: ({ id, product }) => ({
        url: API_ENDPOINTS.PRODUCT_BY_ID(id),
        method: "PUT",
        body: product,
      }),
      invalidatesTags: ["Products"],
    }),

    // Delete product
    deleteProduct: builder.mutation<
      { status: string; message: string },
      number
    >({
      query: (id) => ({
        url: API_ENDPOINTS.PRODUCT_BY_ID(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // Upload product image file — returns standard wrapper { status, message, data: ProductImage }
    uploadProductImage: builder.mutation<
      { status: string; message: string; data: ProductImage },
      { id: number; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}/images/upload`,
        method: "POST",
        body,
      }),
    }),

    // Add URL-based images to an existing product
    addProductImages: builder.mutation<
      { status: string; data: ProductImage[] },
      { id: number; images: { imageUrl: string; altText?: string; isPrimary: boolean; displayOrder: number }[] }
    >({
      query: ({ id, images }) => ({
        url: `/products/${id}/images`,
        method: "POST",
        body: { images },
      }),
      invalidatesTags: ["Products"],
    }),

    // Delete a product image (also removes file from storage)
    deleteProductImage: builder.mutation<
      { status: string; data: null },
      { productId: number; imageId: number }
    >({
      query: ({ productId, imageId }) => ({
        url: `/products/${productId}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useSearchProductsQuery,
  useGetNewArrivalsQuery,
  useGetSpecialOffersQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useAddProductImagesMutation,
  useDeleteProductImageMutation,
} = productsApi;
