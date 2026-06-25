"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types/cart.types";
import { Product } from "@/types/product.types";

const STORAGE_KEY = "guest_cart";

interface GuestCartState {
  items: CartItem[];
}

const initialState: GuestCartState = { items: [] };

function persist(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

// Build a CartItem from a Product. For guests we use the productId as the
// item id (guests have no sizes, so one product == one cart line), and a
// userId of 0. The product snapshot mirrors the shape the API returns so the
// flyout/checkout render identically whether the cart is local or remote.
export function buildGuestCartItem(product: Product, quantity: number): CartItem {
  const now = new Date().toISOString();
  return {
    id: product.id,
    userId: 0,
    productId: product.id,
    quantity,
    createdAt: now,
    updatedAt: now,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      images: product.images?.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
      })),
      brand: product.brand
        ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug }
        : undefined,
    },
  };
}

const guestCartSlice = createSlice({
  name: "guestCart",
  initialState,
  reducers: {
    // Hydrate from localStorage (dispatched once on app mount, after the
    // server render, to avoid a hydration mismatch).
    loadGuestCart: (state) => {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            state.items = JSON.parse(raw);
          } catch {
            state.items = [];
          }
        }
      }
    },
    addGuestCartItem: (
      state,
      action: PayloadAction<{ product: Product; quantity: number }>
    ) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        const next = Math.min(
          existing.quantity + quantity,
          product.stockQuantity || existing.quantity + quantity
        );
        // Refresh the snapshot (price/stock/images may have changed) and qty.
        const rebuilt = buildGuestCartItem(product, next);
        existing.quantity = next;
        existing.product = rebuilt.product;
        existing.updatedAt = rebuilt.updatedAt;
      } else {
        state.items.push(buildGuestCartItem(product, quantity));
      }
      persist(state.items);
    },
    setGuestCartQty: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        persist(state.items);
      }
    },
    removeGuestCartItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.items);
    },
    removeGuestCartItems: (state, action: PayloadAction<number[]>) => {
      const ids = new Set(action.payload);
      state.items = state.items.filter((i) => !ids.has(i.id));
      persist(state.items);
    },
    clearGuestCart: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const {
  loadGuestCart,
  addGuestCartItem,
  setGuestCartQty,
  removeGuestCartItem,
  removeGuestCartItems,
  clearGuestCart,
} = guestCartSlice.actions;

export default guestCartSlice.reducer;
