import { wishlistApi } from "./features/wishlist/wishlistApi";
import { dashboardApi } from "./features/dashboard/dashboardApi";
import { heroApi } from "./features/hero/heroApi";
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./features/auth/authApi";
import { productsApi } from "./features/products/productsApi";
import { categoriesApi } from "./features/categories/categoriesApi";
import { brandsApi } from "./features/brands/brandsApi";
import { ordersApi } from "./features/orders/ordersApi";
import { discountsApi } from "./features/discounts/discountsApi";
import { reviewsApi } from "./features/reviews/reviewsApi";
import { cartApi } from "./features/cart/cartApi";
import { checkoutApi } from "./features/checkout/checkoutApi";
import authReducer from "./features/auth/authSlice";
import uiReducer from "./features/ui/uiSlice";
import guestCartReducer from "./features/cart/guestCartSlice";
import guestWishlistReducer from "./features/wishlist/guestWishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    guestCart: guestCartReducer,
    guestWishlist: guestWishlistReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [brandsApi.reducerPath]: brandsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [discountsApi.reducerPath]: discountsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [heroApi.reducerPath]: heroApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productsApi.middleware,
      categoriesApi.middleware,
      brandsApi.middleware,
      ordersApi.middleware,
      discountsApi.middleware,
      reviewsApi.middleware,
      dashboardApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
      checkoutApi.middleware,
      heroApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
