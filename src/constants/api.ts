export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_VERIFICATION: "/auth/resend-verification",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // Products
  PRODUCTS: "/products",
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

  // Reviews
  REVIEWS: "/reviews",
  REVIEWS_ADMIN: "/reviews/admin/all",
  REVIEW_MODERATE: (id: number) => `/reviews/${id}/moderate`,
};
