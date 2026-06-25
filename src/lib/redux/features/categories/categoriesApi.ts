import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  level: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: number;
  level: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<{ status: string; data: Category[] }, void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),

    // Get category by ID
    getCategoryById: builder.query<{ status: string; data: Category }, number>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "Categories", id }],
    }),

    // Create category
    createCategory: builder.mutation<
      { status: string; data: Category },
      CreateCategoryRequest
    >({
      query: (category) => ({
        url: "/categories",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["Categories"],
    }),

    // Update category
    updateCategory: builder.mutation<
      { status: string; data: Category },
      { id: number; category: UpdateCategoryRequest }
    >({
      query: ({ id, category }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Categories", id },
        "Categories",
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation<{ status: string; data: null }, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
