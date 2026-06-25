import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../baseQuery';
import { DashboardApiResponse, DashboardStats } from '@/types/dashboard.types';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, { startDate?: string; endDate?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        
        return `/dashboard/admin/stats?${searchParams.toString()}`;
      },
      transformResponse: (response: DashboardApiResponse) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;