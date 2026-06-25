"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

export function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

export function StarDisplay({
  rating,
  size = 24,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.25">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          icon={
            i <= Math.floor(rating)
              ? "fa:star"
              : i - 0.5 <= rating
              ? "fa:star-half-o"
              : "fa:star-o"
          }
          width={size}
          height={size}
          className="text-[#E8C03E]"
        />
      ))}
    </div>
  );
}

export function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1.25">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="p-0.5 cursor-pointer"
        >
          <Icon
            icon={(hovered || value) >= i ? "fa:star" : "fa:star-o"}
            className="pointer-events-none text-[#E8C03E] w-5 h-5 lg:w-6 lg:h-6"
          />
        </button>
      ))}
    </div>
  );
}

export function SectionHeading({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center border-b-[0.5px] border-[#B9B7B7] pb-3 mb-6">
      <div className="relative pb-2">
        <div className="flex items-center gap-2">
          <Icon icon={icon} width={20} height={20} className="text-black" />
          <span className="font-inter font-medium text-base leading-none tracking-normal">
            {children}
          </span>
        </div>
        <div className="absolute -bottom-0.5 -left-2.5 -right-2.5 h-0.5 bg-primary" />
      </div>
    </div>
  );
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}
