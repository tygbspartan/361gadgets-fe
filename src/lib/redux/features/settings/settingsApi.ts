import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";

export interface PublicSettings {
  currency: string;
  shippingInsideValley: number;
  shippingOutsideValley: number;
  freeShippingThreshold: number;
}

interface PublicSettingsResponse {
  data: PublicSettings;
}

// Public storefront settings — used at checkout so the displayed shipping/total
// matches what the backend actually charges (both read the same source).
export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getPublicSettings: builder.query<PublicSettings, void>({
      query: () => "/settings/public",
      transformResponse: (response: PublicSettingsResponse) => response.data,
    }),
  }),
});

export const { useGetPublicSettingsQuery } = settingsApi;
