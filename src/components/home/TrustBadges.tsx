"use client";

import {
  ShieldCheck,
  BadgeCheck,
  PackageCheck,
  ShieldPlus,
  Headset,
  type LucideIcon,
} from "lucide-react";
import { useParallax } from "@/hooks/useParallax";

/* Negative: the nearest plane, so it leads the scroll rather than lagging it
   and reads as sitting in front of the hero. Capped by the section's own
   padding — ±20px of travel inside 24px (mobile) / 32px (lg) of it. Going
   further would push the badges into the hairline border. */
const STRIP_DEPTH = -40;

interface TrustBadge {
  icon: LucideIcon;
  /* Split across two lines on desktop so all five columns stay even. */
  title: string;
  subtitle: string;
}

const BADGES: TrustBadge[] = [
  { icon: ShieldCheck, title: "100% Genuine", subtitle: "Products" },
  { icon: BadgeCheck, title: "Authorized Brands", subtitle: "& Partners" },
  { icon: PackageCheck, title: "Original Packaging", subtitle: "Guaranteed" },
  { icon: ShieldPlus, title: "Warranty on All", subtitle: "Products" },
  { icon: Headset, title: "Dedicated Customer", subtitle: "Support" },
];

export default function TrustBadges() {
  const { containerRef, layerRef } = useParallax<HTMLElement, HTMLUListElement>(
    STRIP_DEPTH,
  );

  return (
    <section
      ref={containerRef}
      aria-label="Why shop with us"
      /*
       * Rides up over the hero by 56px. Occlusion is the strongest depth cue
       * available and needs no background texture to work — one surface
       * covering another is unambiguous in a way that differential motion is
       * not. The rounded top and upward shadow are what make it read as a
       * sheet sliding over, rather than a section that simply abuts.
       *
       * z-10 keeps it above the hero; the opaque gradient stops the hero
       * showing through. overflow-hidden clips the badge row's own travel.
       */
      className="relative z-10 -mt-(--hero-overlap) overflow-hidden rounded-t-[28px] border-y border-(--hairline) bg-linear-to-b from-gray-50 to-white shadow-[0_-10px_30px_-14px_rgb(0_0_0/0.18)]"
    >
      <div className="page-wrapper py-6 lg:py-8">
        {/*
         * 2 columns on mobile so the labels stay legible, 3 at md, then all 5
         * abreast from lg. The last cell spans both columns on mobile to avoid
         * a lone orphan in the final row.
         */}
        <ul
          ref={layerRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6 lg:gap-x-2 will-change-transform"
        >
          {BADGES.map(({ icon: Icon, title, subtitle }, i) => (
            <li
              key={title}
              className={`group relative flex items-center gap-3 lg:flex-col lg:gap-2.5 lg:text-center ${
                i === BADGES.length - 1 ? "max-md:col-span-2 max-md:justify-center" : ""
              }`}
            >
              {/* Icon plate — neon hairline at rest, filled bloom on hover. */}
              <span className="relative shrink-0 grid place-items-center w-11 h-11 lg:w-13 lg:h-13 rounded-xl border border-(--hairline) bg-white transition-all duration-300 group-hover:border-(--hairline-strong) group-hover:shadow-(--elev-2)">
                <Icon
                  className="w-5 h-5 lg:w-6 lg:h-6 text-primary transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.75}
                />
              </span>

              <div className="min-w-0">
                <p className="font-montserrat font-semibold text-[12px] lg:text-[13px] leading-tight uppercase tracking-[0.06em] text-foreground">
                  {title}
                </p>
                <p className="font-montserrat font-semibold text-[12px] lg:text-[13px] leading-tight uppercase tracking-[0.06em] text-gray-500 transition-colors duration-300 group-hover:text-primary">
                  {subtitle}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
