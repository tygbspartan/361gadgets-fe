"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WishlistItem } from "@/types/wishlist.types";
import { Product } from "@/types/product.types";

const STORAGE_KEY = "guest_wishlist";

interface GuestWishlistState {
  items: WishlistItem[];
}

const initialState: GuestWishlistState = { items: [] };

function persist(items: WishlistItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

// Build a WishlistItem from a Product. As with the guest cart, the productId
// doubles as the item id. Prices are stored as strings to match the shape the
// wishlist API returns.
export function buildGuestWishlistItem(product: Product): WishlistItem {
  return {
    id: product.id,
    userId: 0,
    productId: product.id,
    createdAt: new Date().toISOString(),
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: String(product.price),
      originalPrice: product.originalPrice != null ? String(product.originalPrice) : null,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      shortDescription: product.shortDescription,
      stockStatus: product.stockStatus,
      images: product.images?.map((img) => ({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      })),
      brand: product.brand
        ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug }
        : undefined,
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : undefined,
    },
  };
}

const guestWishlistSlice = createSlice({
  name: "guestWishlist",
  initialState,
  reducers: {
    loadGuestWishlist: (state) => {
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
    addGuestWishlistItem: (state, action: PayloadAction<{ product: Product }>) => {
      const { product } = action.payload;
      if (state.items.some((i) => i.productId === product.id)) return;
      state.items.push(buildGuestWishlistItem(product));
      persist(state.items);
    },
    removeGuestWishlistItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.items);
    },
    clearGuestWishlist: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const {
  loadGuestWishlist,
  addGuestWishlistItem,
  removeGuestWishlistItem,
  clearGuestWishlist,
} = guestWishlistSlice.actions;

export default guestWishlistSlice.reducer;
