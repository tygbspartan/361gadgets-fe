"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useAddToCartMutation } from "@/lib/redux/features/cart/cartApi";
import { useAddToWishlistMutation } from "@/lib/redux/features/wishlist/wishlistApi";
import { clearGuestCart } from "@/lib/redux/features/cart/guestCartSlice";
import { clearGuestWishlist } from "@/lib/redux/features/wishlist/guestWishlistSlice";

/**
 * Watches for the guest → authenticated transition and merges any
 * localStorage cart/wishlist into the now-logged-in user's account, then
 * clears the local copies. Renders nothing.
 *
 * Runs once per login because we only act on the false → true edge. For a
 * returning user (already logged in on refresh) the guest stores are empty,
 * so the merge is a no-op.
 */
export default function GuestSync() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const guestCart = useSelector((s: RootState) => s.guestCart.items);
  const guestWishlist = useSelector((s: RootState) => s.guestWishlist.items);

  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();

  const wasAuthenticated = useRef(isAuthenticated);
  const merging = useRef(false);

  useEffect(() => {
    const justLoggedIn = !wasAuthenticated.current && isAuthenticated;
    wasAuthenticated.current = isAuthenticated;

    if (!justLoggedIn || merging.current) return;
    if (guestCart.length === 0 && guestWishlist.length === 0) return;

    const cartToMerge = [...guestCart];
    const wishlistToMerge = [...guestWishlist];
    merging.current = true;

    (async () => {
      for (const item of cartToMerge) {
        try {
          await addToCart({ productId: item.productId, quantity: item.quantity }).unwrap();
        } catch {
          /* skip items that fail (e.g. out of stock) */
        }
      }
      for (const item of wishlistToMerge) {
        try {
          await addToWishlist({ productId: item.productId }).unwrap();
        } catch {
          /* skip duplicates / failures */
        }
      }
      dispatch(clearGuestCart());
      dispatch(clearGuestWishlist());
      merging.current = false;
    })();
  }, [isAuthenticated, guestCart, guestWishlist, addToCart, addToWishlist, dispatch]);

  return null;
}
