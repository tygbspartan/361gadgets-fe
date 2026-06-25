"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { WishlistItem } from "@/types/wishlist.types";
import { Product } from "@/types/product.types";
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "./wishlistApi";
import {
  addGuestWishlistItem,
  removeGuestWishlistItem,
} from "./guestWishlistSlice";

const EMPTY: WishlistItem[] = [];

/**
 * Unified wishlist hook. Authenticated users hit the server wishlist; guests
 * use a localStorage-backed slice. Same interface for both.
 */
export function useWishlist() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const guestItems = useSelector((s: RootState) => s.guestWishlist.items);

  const { data: serverItems = EMPTY, isLoading } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const items = isAuthenticated ? serverItems : guestItems;

  const isInWishlist = (productId: number) =>
    items.some((w) => w.productId === productId);

  const addItem = async (product: Product) => {
    if (isInWishlist(product.id)) return;
    if (isAuthenticated) {
      await addToWishlist({ productId: product.id }).unwrap();
    } else {
      dispatch(addGuestWishlistItem({ product }));
    }
  };

  const removeItem = async (item: WishlistItem) => {
    if (isAuthenticated) {
      await removeFromWishlist(item.id).unwrap();
    } else {
      dispatch(removeGuestWishlistItem(item.id));
    }
  };

  return {
    items,
    isLoading: isAuthenticated ? isLoading : false,
    isGuest: !isAuthenticated,
    isInWishlist,
    addItem,
    removeItem,
  };
}
