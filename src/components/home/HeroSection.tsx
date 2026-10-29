import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/constants/routes";
import HeroStage from "@/components/home/HeroStage";

/*
 * Homepage hero. The copy lives here and has no client code of its own; the
 * animated circuit background and spotlight are HeroStage's job.
 *
 * Boot order (see .hero-* in globals.css): traces draw and the scan line
 * sweeps, nodes pop, then the headline lines slide up, followed by the
 * subline, buttons and scroll cue. The inline delays below are that sequence.
 */
export default function HeroSection() {
  return (
    <HeroStage>
      {/* Bottom padding clears the brand strip, which rides up over the hero by
          --hero-overlap. */}
      <div className="page-wrapper relative z-10 flex flex-1 flex-col items-center pt-10 pb-[calc(var(--hero-overlap)+8px)]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="font-montserrat text-[clamp(38px,5.4vw,80px)] font-bold uppercase leading-[0.98] tracking-[-0.02em] text-[#111111]">
            <span className="block overflow-hidden">
              <span className="hero-boot hero-slide block" style={{ animationDelay: "1.2s" }}>
                Premium Tech.
              </span>
            </span>{" "}
            <span className="block overflow-hidden text-[#8A8A8A]">
              <span className="hero-boot hero-slide block" style={{ animationDelay: "1.4s" }}>
                Zero Compromise<span className="text-(--hero-accent)">.</span>
              </span>
            </span>
          </h1>

          <p
            className="hero-boot hero-rise mt-6 max-w-lg font-inter text-[14px] leading-relaxed text-[#555555] lg:text-[17px]"
            style={{ animationDelay: "1.75s" }}
          >
            {BRAND.description.trim()}
          </p>

          <div
            className="hero-boot hero-rise mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "1.95s" }}
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

        {/* In flow below the copy, so the two can never overlap. */}
        <div
          className="hero-boot hero-rise pointer-events-none mt-8 flex shrink-0 flex-col items-center gap-2.5"
          style={{ animationDelay: "2.3s" }}
        >
          <span className="font-inter text-[10px] font-medium uppercase tracking-[0.22em] text-[#555555] lg:text-[11px]">
            Scroll down to shop your favourite gadgets
          </span>
          <ChevronDown className="animate-scroll-cue h-5 w-5 text-[#111111]" strokeWidth={1.5} />
        </div>
      </div>
    </HeroStage>
  );
}
