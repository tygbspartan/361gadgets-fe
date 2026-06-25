export const ROUTES = {
  // Auth routes (shared by both admin and customer)
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  GOOGLE_AUTH_SUCCESS: "/auth/google/success",

  // Admin routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_BRANDS: "/admin/brands",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_DISCOUNTS: "/admin/discounts",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_HERO: "/admin/hero",

  // Customer routes
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT: `/product`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation",
  PROFILE: "/profile/settings",
  ORDERS_HISTORY: "/profile/orders",
  MY_REVIEWS: "/profile/reviews",
  WISHLIST: "/wishlist",
  TERMS: "/terms",
  POLICIES: "/policies",
};
