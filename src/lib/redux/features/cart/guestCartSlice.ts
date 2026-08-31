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

// A guest cart line's id: the productId for a plain product, or a composite of
// product + color so different colors of the same product are separate lines.
function guestLineId(productId: number, colorId?: number): number {
  return colorId ? productId * 1_000_000 + colorId : productId;
}

// Build a CartItem from a Product (+ optional color). For guests the line id is
// derived from product/color, with a userId of 0. The snapshot mirrors the API
// shape so the flyout/checkout render identically whether local or remote.
export function buildGuestCartItem(
  product: Product,
  quantity: number,
  colorId?: number
): CartItem {
  const now = new Date().toISOString();
  const color =
    colorId != null ? product.colors?.find((c) => c.id === colorId) : undefined;
  return {
    id: guestLineId(product.id, colorId),
    userId: 0,
    productId: product.id,
    quantity,
    colorId: color ? color.id : null,
    color: color
      ? {
          id: color.id,
          name: color.name,
          hexCode: color.hexCode,
          stockQuantity: color.stockQuantity,
        }
      : null,
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
      action: PayloadAction<{ product: Product; quantity: number; colorId?: number }>
    ) => {
      const { product, quantity, colorId } = action.payload;
      const lineId = guestLineId(product.id, colorId);
      const existing = state.items.find((i) => i.id === lineId);
      // Stock cap uses the color's stock when a color was chosen.
      const cap =
        (colorId != null
          ? product.colors?.find((c) => c.id === colorId)?.stockQuantity
          : product.stockQuantity) || undefined;
      if (existing) {
        const next = cap
          ? Math.min(existing.quantity + quantity, cap)
          : existing.quantity + quantity;
        // Refresh the snapshot (price/stock/images may have changed) and qty.
        const rebuilt = buildGuestCartItem(product, next, colorId);
        existing.quantity = next;
        existing.product = rebuilt.product;
        existing.color = rebuilt.color;
        existing.updatedAt = rebuilt.updatedAt;
      } else {
        state.items.push(buildGuestCartItem(product, quantity, colorId));
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
