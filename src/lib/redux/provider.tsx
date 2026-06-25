"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { initializeAuth } from "./features/auth/authSlice";
import { loadGuestCart } from "./features/cart/guestCartSlice";
import { loadGuestWishlist } from "./features/wishlist/guestWishlistSlice";
import GuestSync from "@/components/providers/GuestSync";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth + guest cart/wishlist from localStorage on mount.
    store.dispatch(initializeAuth());
    store.dispatch(loadGuestCart());
    store.dispatch(loadGuestWishlist());
  }, []);

  return (
    <Provider store={store}>
      <GuestSync />
      {children}
    </Provider>
  );
}
