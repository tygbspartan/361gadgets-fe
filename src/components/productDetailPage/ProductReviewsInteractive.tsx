"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setActiveCategorySlug } from "@/lib/redux/features/ui/uiSlice";
import { useGetReviewEligibilityQuery } from "@/lib/redux/features/reviews/reviewsApi";
import WriteReview from "./WriteReview";

/**
 * Client island for the product page's interactive, auth-dependent bits:
 *  - keeps the navbar's active-category highlight in sync
 *  - shows the "write a review" form only to customers who received the item
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

  // The server checks for a delivered order containing this product — the same
  // rule it applies when the review is submitted.
  const { data: eligibility } = useGetReviewEligibilityQuery(
    { productId, userId: user?.id ?? 0 },
    { skip: !isAuthenticated || !user }
  );

  // reviewerIds comes from the server-rendered (cached) review list, so the
  // live answer is checked too.
  const hasReviewed =
    (eligibility?.hasReviewed ?? false) || (user ? reviewerIds.includes(user.id) : false);

  if (!eligibility?.canReview) return null;

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
