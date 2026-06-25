"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateReviewMutation } from "@/lib/redux/features/reviews/reviewsApi";
import { useToast } from "@/components/ui/ToastStack";
import { ROUTES } from "@/constants/routes";
import { StarSelector } from "./shared";

interface Props {
  productId: number;
  isAuthenticated: boolean;
  onReviewSubmitted: () => void;
  hasReviewed?: boolean;
}

export default function WriteReview({ productId, isAuthenticated, onReviewSubmitted, hasReviewed }: Props) {
  const router = useRouter();
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const { showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("")
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating === 0) { setError("Please select a rating."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }
    try {
      await createReview({ productId, rating, title: title || undefined, comment }).unwrap();
      setRating(0);
      setTitle("");
      setComment("");
      showToast({ icon: "hugeicons:star-01", title: "Review Added!", variant: "positive" });
      onReviewSubmitted();
    } catch (err: any) {
      setError(err?.data?.message || "Failed to submit review. Please try again.");
    }
  };

  return (
    <>
      <div>
        <h2 className="font-montserrat font-medium text-[18px] lg:text-2xl leading-none text-black w-fit mx-auto lg:mx-0 text-center border-b-2 border-primary pb-1 mb-5">
          Write a review!
        </h2>

        {hasReviewed ? (
          <p className="font-inter font-normal text-[12px] lg:text-[16px] leading-6 text-[#4B4B4B]">
            Thank you for reviewing the product!
          </p>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 lg:gap-3.75">
          <StarSelector value={rating} onChange={setRating} />

          <div className="flex flex-col gap-2.5">
            <label className="font-montserrat font-normal text-[12px] lg:text-base leading-none text-black">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise your experience"
              className="w-full h-8.75 lg:h-10 border border-[#C9C9C9] rounded-[3px] px-3 font-montserrat font-normal text-[12px] lg:text-base outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="font-montserrat font-normal text-[12px] lg:text-base leading-none text-black">
              Description
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full border border-[#C9C9C9] rounded-[3px] px-3 py-2.5 font-montserrat font-normal text-[12px] lg:text-base outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          {error && <p className="font-inter text-sm text-red-500">{error}</p>}

          <button
            type={isAuthenticated ? "submit" : "button"}
            onClick={!isAuthenticated ? () => router.push(ROUTES.LOGIN) : undefined}
            disabled={isLoading}
            className="w-fit bg-black text-white font-inter font-medium text-[10px] lg:text-base leading-none uppercase rounded-[3px] p-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          >
            {isLoading ? "Posting…" : "POST"}
          </button>
        </form>
        )}
      </div>

    </>
  );
}
