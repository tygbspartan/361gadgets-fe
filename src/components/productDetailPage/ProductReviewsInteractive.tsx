"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setActiveCategorySlug } from "@/lib/redux/features/ui/uiSlice";
import { useGetUserOrdersQuery } from "@/lib/redux/features/orders/ordersApi";
import WriteReview from "./WriteReview";

/**
 * Client island for the product page's interactive, auth-dependent bits:
 *  - keeps the navbar's active-category highlight in sync
 *  - shows the "write a review" form only to customers who purchased the item
 * The reviews themselves are server-rendered by the page (crawlable); this
 * component adds nothing to the initial HTML unless the viewer can write one.
 */
export default function ProductReviewsInteractive({
  productId,
  reviewerIds,
  categorySlug,
}: {
  productId: number;
  reviewerIds: number[];
  categorySlug: string | null;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (categorySlug) dispatch(setActiveCategorySlug(categorySlug));
    return () => {
      dispatch(setActiveCategorySlug(null));
    };
  }, [categorySlug, dispatch]);

  const { data: ordersData } = useGetUserOrdersQuery(
    { page: 1, limit: 200 },
    { skip: !isAuthenticated }
  );

  const hasPurchased =
    ordersData?.orders.some(
      (order) =>
        order.status !== "cancelled" &&
        order.items.some((item) => item.productId === productId)
    ) ?? false;

  const hasReviewed = user ? reviewerIds.includes(user.id) : false;

  if (!hasPurchased) return null;

  return (
    <div id="write-review">
      <WriteReview
        productId={productId}
        isAuthenticated={isAuthenticated}
        onReviewSubmitted={() => router.refresh()}
        hasReviewed={hasReviewed}
      />
    </div>
  );
}
