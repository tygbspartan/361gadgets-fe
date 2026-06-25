"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import EmptyState from "@/components/ui/EmptyState";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { RootState } from "@/lib/redux/store";
import {
  useGetMyReviewsQuery,
  useDeleteMyReviewMutation,
  useCreateFollowupMutation,
} from "@/lib/redux/features/reviews/reviewsApi";
import { StarDisplay } from "@/components/productDetailPage/shared";
import { useToast } from "@/components/ui/ToastStack";
import { ROUTES } from "@/constants/routes";
import ProfileNavMobile from "@/components/profile/ProfileNavMobile";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfileReviewsPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const { data: reviews, isLoading } = useGetMyReviewsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [deleteReview] = useDeleteMyReviewMutation();
  const [createFollowup, { isLoading: isSubmittingFollowup }] = useCreateFollowupMutation();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; productId: number } | null>(null);
  const [followupModal, setFollowupModal] = useState<{ reviewId: number } | null>(null);
  const [followupComment, setFollowupComment] = useState("");
  const [followupError, setFollowupError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push(ROUTES.LOGIN);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const initialReviews = reviews?.filter((r) => r.reviewType !== "followup") ?? [];

  function getFollowup(reviewId: number, productId: number) {
    return (
      reviews?.find(
        (r) =>
          r.reviewType === "followup" &&
          (r.parentReviewId === reviewId || r.productId === productId)
      ) ?? null
    );
  }

  const openFollowupModal = (reviewId: number) => {
    setFollowupComment("");
    setFollowupError("");
    setFollowupModal({ reviewId });
  };

  const closeFollowupModal = () => setFollowupModal(null);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id, productId } = deleteConfirm;
    setDeleteConfirm(null);
    setDeletingId(id);
    try {
      // Delete the follow-up review first (if any), then the initial review.
      const followup = getFollowup(id, productId);
      if (followup) {
        await deleteReview({ id: followup.id, productId }).unwrap();
      }
      await deleteReview({ id, productId }).unwrap();
      showToast({ icon: "mdi:delete-outline", title: "Review Deleted!", variant: "negative" });
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const handleFollowupSubmit = async () => {
    setFollowupError("");
    if (!followupComment.trim()) {
      setFollowupError("Please write a description.");
      return;
    }
    try {
      await createFollowup({
        initialReviewId: followupModal!.reviewId,
        data: { comment: followupComment.trim() },
      }).unwrap();
      closeFollowupModal();
      showToast({
        icon: "hugeicons:comment-add-02",
        title: "Follow-up Submitted!",
        description: "Your follow-up will appear once reviewed by our team.",
        variant: "positive",
      });
    } catch (err: any) {
      setFollowupError(err?.data?.message || "Failed to submit follow-up. Please try again.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Title — centered on mobile */}
        <div className="w-fit mx-auto lg:mx-0 text-center">
          <h1 className="font-montserrat font-medium text-[18px] lg:text-[24px] leading-none text-black">
            My Reviews
          </h1>
          <div className="h-0.5 bg-primary mt-1.5" />
        </div>

        {/* Mobile: User Settings dropdown */}
        <ProfileNavMobile />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : initialReviews.length === 0 ? (
          <EmptyState
            icon="carbon:review"
            title="No reviews yet."
            description="Your reviews will appear here once you start sharing them."
            className="py-16"
          />
        ) : (
          <div className="flex flex-col gap-5">
            {initialReviews.map((review) => {
              const isDeleting = deletingId === review.id;
              const productHref = review.product?.slug
                ? `${ROUTES.PRODUCT}/${review.product.slug}`
                : "#";
              const primaryImage = review.product?.images?.[0]?.imageUrl;
              const followup = getFollowup(review.id, review.productId);
              const hasFollowup = !!followup;
              const canFollowUp = review.isApproved && !hasFollowup;

              return (
                <div
                  key={review.id}
                  className="border border-[#E2E4E5] rounded-lg px-5 lg:px-8 py-5 flex flex-col gap-3.75"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-montserrat font-semibold text-[18px] lg:text-[20px] leading-7 text-black">
                      Review
                    </span>
                    <span className="font-montserrat font-normal text-[12px] lg:text-[16px] leading-4 lg:leading-none text-[#454545]">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  {/* Product row */}
                  <div className="flex items-start gap-5 mt-1.25">
                    <Link
                      href={productHref}
                      className="relative shrink-0 w-17.5 h-17.5 lg:w-18.75 lg:h-18.75 block overflow-hidden bg-[#F8F8F8] border border-[#C9C9C9]"
                    >
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={review.product?.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col gap-1.75 pt-1">
                      <Link href={productHref}>
                        <p className="font-montserrat font-medium text-[14px] lg:text-[16px] leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
                          {review.product?.name || "Product"}
                        </p>
                      </Link>
                      {review.product?.brand && (
                        <p className="font-montserrat font-medium text-[12px] lg:text-[16px] leading-none text-[#4B4B4B]">
                          {review.product.brand.name}
                        </p>
                      )}
                      <StarDisplay rating={review.rating} size={20} />
                    </div>
                  </div>

                  {/* Review comment + follow-up */}
                  <div className="flex flex-col gap-3.75">
                    {review.comment && (
                      <p className="font-inter font-normal text-[14px] lg:text-[16px] leading-6 tracking-[0.02em] text-justify break-words [overflow-wrap:anywhere] text-[#4B4B4B]">
                        {review.comment}
                      </p>
                    )}
                    {hasFollowup && followup && followup.isApproved && (
                      <div className="flex flex-col gap-3.75">
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="font-inter font-semibold text-[16px] leading-6 tracking-[0.02em] text-black">
                            Follow up
                          </span>
                          <span className="font-montserrat font-normal text-[12px] lg:text-[14px] leading-4 lg:leading-none text-[#454545]">
                            {formatDate(followup.createdAt)}
                          </span>
                        </div>
                        <p className="font-inter font-normal text-[14px] lg:text-[16px] leading-6 tracking-[0.02em] text-justify break-words [overflow-wrap:anywhere] text-[#4B4B4B]">
                          {followup.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#B9B7B7]" />

                  {/* Buttons */}
                  <div className="flex items-center gap-5">
                    {canFollowUp && (
                      <button
                        onClick={() => openFollowupModal(review.id)}
                        className="flex items-center justify-center border border-black bg-white text-black font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-3.25 lg:px-3.75 py-0 lg:py-1.5 hover:bg-gray-50 transition-colors"
                      >
                        Add Follow-up
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm({ id: review.id, productId: review.productId })}
                      disabled={isDeleting}
                      className="flex items-center justify-center border border-black bg-white text-black font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-3.25 lg:px-3.75 py-0 lg:py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? "Deleting…" : "Delete Review"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="bg-white rounded-lg w-128.75 p-6.25 flex flex-col gap-5 relative mx-4">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <Icon icon="material-symbols:close" width={20} height={20} />
            </button>
            <h3 className="font-inter font-semibold text-[18px] leading-7 text-black">
              Are you sure you want to delete?
            </h3>
            <div className="flex justify-end">
              <button
                onClick={confirmDelete}
                className="bg-black text-white font-inter font-semibold text-base leading-none uppercase rounded-[3px] px-5 py-2.5 hover:opacity-80 transition-opacity"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {followupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) closeFollowupModal(); }}
        >
          <div className="bg-white rounded-lg w-128.75 p-6.25 flex flex-col gap-5 relative mx-4">
            <button
              onClick={closeFollowupModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <Icon icon="material-symbols:close" width={20} height={20} />
            </button>
            <h3 className="font-inter font-semibold text-[18px] leading-7 text-black">
              Post a follow up?
            </h3>
            <div className="flex flex-col gap-1.5">
              <textarea
                value={followupComment}
                onChange={(e) => setFollowupComment(e.target.value)}
                placeholder="How has the product held up?"
                rows={4}
                className="w-full border border-[#C9C9C9] rounded-[5px] px-3 py-2.5 font-inter font-normal text-base outline-none focus:border-black transition-colors resize-none"
              />
            </div>
            {followupError && (
              <p className="font-inter text-sm text-red-500">{followupError}</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleFollowupSubmit}
                disabled={isSubmittingFollowup}
                className="bg-black text-white font-inter font-semibold text-base leading-none uppercase rounded-[3px] px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                {isSubmittingFollowup ? "Posting…" : "POST"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
