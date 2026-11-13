import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/constants/routes";
import HeroStage from "@/components/home/HeroStage";

/*
 * Homepage hero. The copy lives here and has no client code of its own; the
 * animated circuit background and spotlight are HeroStage's job.
 *
 * Boot order (see .hero-* in globals.css): the headline slides up almost at
 * once while the board's traces draw behind it, then the subline, buttons and
 * scroll cue follow, with the nodes popping in. The inline delays below are
 * that sequence; the whole boot settles in about 1.3s.
 */
export default function HeroSection() {
  return (
    <HeroStage>
      {/* Bottom padding clears the brand strip, which rides up over the hero by
          --hero-overlap. hero-copy fades the whole block as the page scrolls.
          Everything marked data-hero-clear is kept clear of the circuit board. */}
      <div className="hero-copy page-wrapper relative z-10 flex flex-1 flex-col items-center pt-10 pb-[calc(var(--hero-overlap)+8px)]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 data-hero-clear className="font-montserrat text-[clamp(38px,5.4vw,80px)] font-bold uppercase leading-[0.98] tracking-[-0.02em] text-[#111111]">
            <span className="block overflow-hidden">
              <span className="hero-boot hero-slide block" style={{ animationDelay: "0.25s" }}>
                Premium Tech.
              </span>
            </span>{" "}
            <span className="block overflow-hidden text-[#8A8A8A]">
              <span className="hero-boot hero-slide block" style={{ animationDelay: "0.38s" }}>
                Zero Compromise<span className="text-(--hero-accent)">.</span>
              </span>
            </span>
          </h1>

          <p
            data-hero-clear
            className="hero-boot hero-rise mt-6 max-w-lg font-inter text-[14px] leading-relaxed text-[#555555] lg:text-[17px]"
            style={{ animationDelay: "0.6s" }}
          >
            {BRAND.description.trim()}
          </p>

          <div
            data-hero-clear
            className="hero-boot hero-rise mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.72s" }}
          >
            <Link
              href={ROUTES.PRODUCTS}
              className="hero-btn inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-white lg:text-[14px]"
            >
              Shop All Gear
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${ROUTES.PRODUCTS}?sortBy=createdAt&sortOrder=desc`}
              className="hero-btn inline-flex items-center gap-2 rounded-full border border-[#111111]/25 px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-[#111111] lg:text-[14px]"
            >
              New Arrivals
            </Link>
          </div>
        </div>

        {/* In flow below the copy, so the two can never overlap. Not part of
            the board's clear zone (that would empty the whole bottom of the
            hero); a soft halo in the hero's grey keeps traces off it instead. */}
        <div
          className="hero-boot hero-rise pointer-events-none mt-8 flex shrink-0 flex-col items-center gap-2.5"
          style={{ animationDelay: "0.95s" }}
        >
          <span className="rounded-full bg-(--hero-bg) px-2 font-inter text-[10px] font-medium uppercase tracking-[0.22em] text-[#555555] shadow-[0_0_16px_12px_var(--hero-bg)] lg:text-[11px]">
            Scroll down to shop your favourite gadgets
          </span>
          <ChevronDown className="animate-scroll-cue h-5 w-5 text-[#111111]" strokeWidth={1.5} />
        </div>
      </div>
    </HeroStage>
  );
}
