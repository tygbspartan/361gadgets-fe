import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";

export interface HeroImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const heroApi = createApi({
  reducerPath: "heroApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Hero"],
  endpoints: (builder) => ({
    getHeroImages: builder.query<{ status: string; data: HeroImage[] }, void>({
      query: () => "/hero",
      providesTags: ["Hero"],
    }),
    getAllHeroImages: builder.query<{ status: string; data: HeroImage[] }, void>({
      query: () => "/hero/all",
      providesTags: ["Hero"],
    }),
    uploadHeroImage: builder.mutation<{ status: string; data: HeroImage }, FormData>({
      query: (formData) => ({
        url: "/hero/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Hero"],
    }),
    updateHeroImage: builder.mutation<
      { status: string; data: HeroImage },
      { id: number; body: { altText?: string; linkUrl?: string | null; displayOrder?: number; isActive?: boolean } }
    >({
      query: ({ id, body }) => ({
        url: `/hero/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Hero"],
    }),
    reorderHeroImages: builder.mutation<
      { status: string; data: HeroImage[] },
      { order: { id: number; displayOrder: number }[] }
    >({
      query: (body) => ({
        url: "/hero/reorder",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Hero"],
    }),
    deleteHeroImage: builder.mutation<{ status: string; data: null }, number>({
      query: (id) => ({
        url: `/hero/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Hero"],
    }),
  }),
});

export const {
  useGetHeroImagesQuery,
  useGetAllHeroImagesQuery,
  useUploadHeroImageMutation,
  useUpdateHeroImageMutation,
  useReorderHeroImagesMutation,
  useDeleteHeroImageMutation,
} = heroApi;
