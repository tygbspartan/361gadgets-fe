"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types/product.types";

/*
 * Products picked for side-by-side comparison (max 3, one product group).
 * Saved on this device so the selection survives page loads; loaded once on
 * startup by the Redux provider (loadCompare).
 */
export const COMPARE_MAX = 3;
const STORAGE_KEY = "compare_items";

export interface CompareItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  /** The product group (level-3 category). Items must share it. */
  categoryId: number | null;
  categoryName: string | null;
}

interface CompareState {
  items: CompareItem[];
}

const initialState: CompareState = { items: [] };

function persist(items: CompareItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage blocked: the selection just lasts for this visit
  }
}

export function toCompareItem(product: Product): CompareItem {
  const image =
    product.images?.find((i) => i.isPrimary)?.imageUrl ?? product.images?.[0]?.imageUrl ?? null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: image,
    categoryId: product.category?.id ?? product.categoryId ?? null,
    categoryName: product.category?.name ?? null,
  };
}

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    loadCompare(state) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as CompareItem[]) : [];
        state.items = Array.isArray(parsed) ? parsed.slice(0, COMPARE_MAX) : [];
      } catch {
        state.items = [];
      }
    },
    addCompare(state, action: PayloadAction<CompareItem>) {
      if (state.items.some((i) => i.id === action.payload.id)) return;
      if (state.items.length >= COMPARE_MAX) return;
      state.items.push(action.payload);
      persist(state.items);
    },
    /** Start a fresh list with this item (used when switching product group). */
    replaceCompare(state, action: PayloadAction<CompareItem>) {
      state.items = [action.payload];
      persist(state.items);
    },
    removeCompare(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.items);
    },
    clearCompare(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { loadCompare, addCompare, replaceCompare, removeCompare, clearCompare } =
  compareSlice.actions;
export default compareSlice.reducer;
