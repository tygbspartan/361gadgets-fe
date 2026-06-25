export interface DashboardStats {
  // Top section
  totalProducts: number;
  totalDiscounts: number;
  totalBrands: number;
  
  // Date range stats
  dateRange: {
    start: string;
    end: string;
  };
  totalOrders: number;
  totalRevenue: string;
  
  // Orders breakdown
  ordersByStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export interface DashboardApiResponse {
  status: string;
  message: string;
  data: DashboardStats;
}