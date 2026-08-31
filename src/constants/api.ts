export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  UPDATE_PROFILE: "/auth/me", // PATCH — self-service profile update
  CHANGE_PASSWORD: "/auth/change-password",
  LOGOUT: "/auth/logout",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_VERIFICATION: "/auth/resend-verification",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // Products
  PRODUCTS: "/products",
  PRODUCTS_ADMIN: "/products/admin/list", // own products (superadmin: all, ?ownerId=)
  PRODUCTS_COMPARE: "/products/compare", // ?ids=1,2,3 (max 3)
  PRODUCT_BY_ID: (id: number) => `/products/${id}`,
  PRODUCT_BY_SLUG: (slug: string) => `/products/slug/${slug}`,

  // Categories
  CATEGORIES: "/categories",
  CATEGORY_TREE: "/categories/tree",
  CATEGORY_BY_ID: (id: number) => `/categories/${id}`,

  // Brands
  BRANDS: "/brands",
  BRAND_BY_ID: (id: number) => `/brands/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDERS_ADMIN: "/orders/admin/all",
  ORDER_BY_ID: (id: number) => `/orders/admin/${id}`,
  ORDER_STATUS: (id: number) => `/orders/admin/${id}/status`,
  ORDER_PAYMENT: (id: number) => `/orders/admin/${id}/payment`,

  // Discounts
  DISCOUNTS: "/discounts",
  DISCOUNT_BY_ID: (id: number) => `/discounts/${id}`,

  // Vendors (superadmin only)
  VENDORS: "/admin/vendors",
  VENDOR_BY_ID: (id: number) => `/admin/vendors/${id}`,
  VENDOR_STATUS: (id: number) => `/admin/vendors/${id}/status`,
  VENDOR_LOGO_UPLOAD: (id: number) => `/admin/vendors/${id}/logo/upload`,
  VENDOR_LOGO_DELETE: (id: number) => `/admin/vendors/${id}/logo`,
  VENDOR_BRANDS: (id: number) => `/admin/vendors/${id}/brands`,

  // Vendor earnings / payouts owed (superadmin only)
  VENDOR_EARNINGS: "/admin/vendors/earnings",
  VENDOR_EARNINGS_DETAIL: (id: number) => `/admin/vendors/${id}/earnings`,

  // Catalog requests (vendors request new brands/categories)
  CATALOG_REQUESTS: "/catalog-requests",

  // Reviews
  REVIEWS: "/reviews",
  REVIEWS_ADMIN: "/reviews/admin/all",
  REVIEW_MODERATE: (id: number) => `/reviews/${id}/moderate`,
};
