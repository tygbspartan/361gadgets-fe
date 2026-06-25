"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Review } from "@/types/review.types";
import EmptyState from "@/components/ui/EmptyState";
import { StarDisplay, timeAgo } from "./shared";


interface Props {
  reviews: Review[];
}

export default function ProductReviewsList({ reviews }: Props) {
  const [visibleCount, setVisibleCount] = useState(3);

  return (
    <div>
      <h2 className="font-montserrat font-medium text-[18px] lg:text-2xl leading-none text-black w-fit mx-auto lg:mx-0 text-center border-b-2 border-primary pb-1 mb-5">
        Reviews
      </h2>

      {reviews.length === 0 ? (
        <EmptyState
          icon="carbon:review"
          title="No reviews yet."
          description="Have you tried this product? Share your experience and help others decide."
          className="py-2.5 lg:py-8"
        />
      ) : (
        <div className="flex flex-col gap-3.75">
          {reviews.slice(0, visibleCount).map((review) => {
            const firstName = review.user?.firstName ?? "";
            const lastName = review.user?.lastName ?? "";
            const displayName =
              firstName || lastName
                ? `${firstName}${lastName ? " " + lastName : ""}`.trim()
                : review.user?.email?.split("@")[0] ?? "Anonymous";

            return (
              <div key={review.id}>
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Icon
                      icon="hugeicons:user-ai"
                      width={24}
                      height={24}
                      className="text-[#747373] shrink-0"
                    />
                    <span className="font-montserrat font-semibold text-[14px] lg:text-base leading-none text-black">
                      {displayName}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 rounded-full border border-[#9CA3AF] bg-[#F3F4F6] px-2.5 py-0.5">
                        <Icon icon="material-symbols:verified-outline" className="shrink-0 text-black w-4.5 h-4.5 lg:w-5 lg:h-5" />
                        <span className="font-inter font-medium text-[12px] lg:text-[14px] leading-5.5 text-[#374151]">
                          Verified Buyer
                        </span>
                      </span>
                    )}
                    <span className="font-montserrat font-normal text-[12px] lg:text-sm leading-none text-[#747373]">
                      {timeAgo(review.createdAt)}
                    </span>
                    {/* Rating — right on desktop */}
                    <div className="ml-auto shrink-0 hidden lg:block">
                      <StarDisplay rating={review.rating} size={20} />
                    </div>
                  </div>
                  {/* Rating — below header on mobile, 3px gap */}
                  <div className="lg:hidden mt-0.75">
                    <StarDisplay rating={review.rating} size={20} />
                  </div>
                  <p className="mt-1.25 font-inter font-normal text-[14px] lg:text-base leading-6 tracking-[0.02em] text-justify text-[#4B4B4B]">
                    {review.comment}
                  </p>

                  {/* Nested follow-up */}
                  {review.followupReview && (
                    <div className="flex flex-col gap-2.5 mt-3.75">
                      <div className="flex items-center gap-2.5">
                        <span className="font-inter font-semibold text-[16px] leading-6 tracking-[0.02em] text-black">
                          Follow up
                        </span>
                        <span className="font-montserrat font-normal text-[14px] leading-none text-[#454545]">
                          {timeAgo(review.followupReview.createdAt)}
                        </span>
                      </div>
                      <p className="font-inter font-normal text-[16px] leading-6 tracking-[0.02em] text-justify text-[#4B4B4B]">
                        {review.followupReview.comment}
                      </p>
                    </div>
                  )}
                </div>
                <hr className="mt-3.75 border-[#AFAFAF]" />
              </div>
            );
          })}
        </div>
      )}

      {reviews.length > visibleCount && (
        <button
          onClick={() => setVisibleCount((c) => c + 3)}
          className="mt-6 font-inter font-medium text-[14px] lg:text-base leading-6 tracking-[0.02em] text-justify underline text-foreground hover:text-primary transition-colors"
        >
          Load More Reviews
        </button>
      )}
    </div>
  );
}
