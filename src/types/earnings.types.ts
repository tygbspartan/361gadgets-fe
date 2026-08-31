// Superadmin vendor earnings / payouts.
//
// Money is collected into the platform (superadmin) account, so these figures
// show how much each vendor generated and how much the platform still owes them.
//   grossSales    = the vendor's item subtotals (price × qty), cancelled excluded
//   amountOwed    = payable now = orders that are BOTH paid AND delivered
//   pendingPayout = grossSales − amountOwed (sold, not yet payable)

export interface EarningsDateRange {
  start: string | null;
  end: string | null;
}

export interface EarningsFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface VendorEarningsRow {
  vendorId: number;
  vendor: {
    id: number;
    email: string;
    companyName: string | null;
    name: string;
    isActive: boolean;
  };
  unitsSold: number;
  orderCount: number;
  grossSales: string;
  amountOwed: string;
  pendingPayout: string;
}

export interface VendorEarningsTotals {
  grossSales: string;
  amountOwed: string;
  pendingPayout: string;
}

export interface VendorEarningsSummary {
  dateRange: EarningsDateRange;
  totals: VendorEarningsTotals;
  vendors: VendorEarningsRow[];
}

export interface VendorEarningsSummaryApiResponse {
  status: string;
  message: string;
  data: VendorEarningsSummary;
}

// ---- Per-vendor detail (order-by-order breakdown) ----

export interface VendorEarningsOrderItem {
  id: number;
  productName: string;
  productSku: string | null;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface VendorEarningsOrder {
  orderId: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  payable: boolean;
  vendorSubtotal: string;
  items: VendorEarningsOrderItem[];
}

export interface VendorEarningsDetail {
  vendor: {
    id: number;
    email: string;
    companyName: string | null;
    name: string;
    isActive: boolean;
  };
  dateRange: EarningsDateRange;
  totals: {
    orderCount: number;
    grossSales: string;
    amountOwed: string;
    pendingPayout: string;
  };
  orders: VendorEarningsOrder[];
}

export interface VendorEarningsDetailApiResponse {
  status: string;
  message: string;
  data: VendorEarningsDetail;
}
