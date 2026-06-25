"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { CartItem } from "@/types/cart.types";
import { Product } from "@/types/product.types";
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
} from "./cartApi";
import {
  addGuestCartItem,
  setGuestCartQty,
  removeGuestCartItem,
} from "./guestCartSlice";

const EMPTY: CartItem[] = [];

/**
 * Unified cart hook. For authenticated users it reads/writes the server cart
 * via RTK Query; for guests it reads/writes a localStorage-backed slice. All
 * consumers use the same interface and never branch on auth themselves.
 */
export function useCart() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const guestItems = useSelector((s: RootState) => s.guestCart.items);

  const { data: serverItems = EMPTY, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToCart] = useAddToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  const items = isAuthenticated ? serverItems : guestItems;

  const addItem = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      await addToCart({ productId: product.id, quantity }).unwrap();
    } else {
      dispatch(addGuestCartItem({ product, quantity }));
    }
  };

  const updateQuantity = async (item: CartItem, quantity: number) => {
    if (isAuthenticated) {
      await updateCartItem({ id: item.id, data: { quantity } }).unwrap();
    } else {
      dispatch(setGuestCartQty({ id: item.id, quantity }));
    }
  };

  const removeItem = async (item: CartItem) => {
    if (isAuthenticated) {
      await removeFromCart(item.id).unwrap();
    } else {
      dispatch(removeGuestCartItem(item.id));
    }
  };

  return {
    items,
    isLoading: isAuthenticated ? isLoading : false,
    isGuest: !isAuthenticated,
    addItem,
    updateQuantity,
    removeItem,
  };
}
