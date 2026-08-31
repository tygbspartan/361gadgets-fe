"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/constants/routes";
import LedMatrix from "@/components/home/LedMatrix";
import { useParallax, useScrollProgress } from "@/hooks/useParallax";

/*
 * Typographic hero on a black stage that wipes away to the white page.
 *
 * The copy never fades — it stays put and inverts, black-on-white below the
 * wipe edge and white-on-black above it, courtesy of mix-blend-mode: difference
 * on the whole content group.
 *
 * That only works because the background *wipes* rather than cross-fading. A
 * fade passes through mid-grey, where a difference blend renders the glyph at
 * exactly the same grey as its backdrop and the text disappears. A hard edge
 * keeps every pixel at one extreme or the other, so contrast is always maximal
 * — and a headline straddling the edge is half white, half black.
 */
/*
 * The hero pins. The section is a tall scroll track; the stage inside is sticky
 * and holds still while the black lifts, then releases and scrolls away like
 * anything else. TRACK_H sets how long it stays put — 200svh gives roughly one
 * extra screen of scrolling spent on the transition.
 */
const TRACK_H = "h-[200svh]";
/* Progress at which the black has fully lifted. Tuned to land just before the
   sticky stage releases (~0.54 of the track), so the change is finished while
   the hero is still pinned rather than completing on the way out. */
const WIPE_BY = 0.5;

/* Scroll cue, nearest plane. Travel is only ±15px now that the cue sits in the
   flow directly below the copy — a bigger swing would close the gap between
   them on a short viewport, which is exactly what the layout change fixed. */
const CUE_DEPTH = -30;

export default function HeroSection() {
  /* Destructured rather than kept as objects: `obj.somethingRef` read during
     render trips react-hooks' "cannot access refs during render" rule, even
     though these are callback refs rather than ref objects. */
  const { containerRef: sectionRef, layerRef: sceneRef } = useScrollProgress<
    HTMLElement,
    HTMLDivElement
  >(WIPE_BY);
  const { containerRef: cueBoxRef, layerRef: cueRef } = useParallax<
    HTMLDivElement,
    HTMLDivElement
  >(CUE_DEPTH);

  return (
    /* The track. Height here is scroll distance, not visual height — the stage
       inside is what you actually see. */
    <section ref={sectionRef} className={`relative ${TRACK_H}`}>
      {/*
       * The pinned stage. Sticks below the navbar and fills the rest of the
       * viewport, so the hero holds still while the background changes.
       * --p lands here (not on an inner layer) because both the fill and every
       * piece of copy derive their colour from it.
       */}
      <div
        ref={sceneRef}
        className="hero-stage sticky top-(--nav-h) h-[calc(100svh-var(--nav-h))] overflow-hidden isolate bg-background"
      >
        {/* Black fill, fading uniformly to reveal the white stage beneath. */}
        <div aria-hidden className="hero-fill pointer-events-none absolute inset-0 -z-10" />

        {/*
         * The disc watermark. position: fixed, so this single element starts
         * centred in the hero and then travels down the page with the viewport
         * — there is no second copy handing over. Sits after .hero-fill at the
         * same -z-10, so it paints above the stage background but below all
         * content.
         *
         * It must not live inside the parallax layer: that layer carries a
         * transform, and a transformed ancestor becomes the containing block
         * for fixed descendants, which would pin the mark back to the hero.
         */}
        <div aria-hidden className="site-mark pointer-events-none -z-10">
          <Image
            src={BRAND.logo.markOnDark}
            alt=""
            fill
            sizes="(max-width: 1024px) 34vw, 480px"
            className="hero-mark-dark object-contain"
          />
          <Image
            src={BRAND.logo.markOnLight}
            alt=""
            fill
            sizes="(max-width: 1024px) 34vw, 480px"
            className="hero-mark-light object-contain"
          />
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* Mid grey, so the dots read against black *and* white without the
              canvas needing to re-read its colour when the stage flips. */}
          <LedMatrix className="absolute inset-0 h-full w-full text-[#8a8a8a]" />
        </div>

      {/*
       * Fills the pinned stage as two stacked rows rather than centred content
       * with an absolutely-positioned cue over it. The old arrangement let the
       * two collide: the copy centred in the *full* height while the cue sat at
       * a fixed offset from the bottom, so on a short viewport the centred
       * block simply grew into it. Here the cue reserves its own row and the
       * copy centres in whatever is left, so they can never overlap.
       */}
      <div className="page-wrapper relative flex h-full flex-col items-center py-8 lg:py-10">
        {/*
         * Every colour comes from --ink / --ink-inv, which step at the flip
         * point rather than tracking the fade. Dimmer tones use opacity so
         * they stay correct in both states without a second variable.
         */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/*
           * Sized against viewport height as well as width. The old
           * width-only breakpoints meant a 1280×720 laptop got the same 86px
           * as a 1440×900 one, and the copy crowded the cue. min() takes
           * whichever dimension is the tighter constraint.
           */}
          <h1 className="hero-swap font-montserrat text-[clamp(32px,min(6.2vw,9.6vh),88px)] font-bold uppercase leading-[0.95] tracking-[-0.02em] text-(--ink)">
            Premium Tech.
            <br />
            <span className="opacity-40">Zero Compromise<span className="text-red-600">.</span></span>
          </h1>

          <p className="hero-swap mt-6 max-w-lg font-inter text-[14px] leading-relaxed text-(--ink) opacity-60 lg:text-[17px]">
            {BRAND.description.trim()}
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.PRODUCTS}
              className="hero-swap inline-flex items-center gap-2 rounded-full bg-(--ink) px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-(--ink-inv) lg:text-[14px]"
            >
              Shop All Gear
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${ROUTES.PRODUCTS}?sortBy=createdAt&sortOrder=desc`}
              className="hero-swap inline-flex items-center gap-2 rounded-full border border-(--ink-soft) px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-(--ink) lg:text-[14px]"
            >
              New Arrivals
            </Link>
          </div>
        </div>

        {/* In flow, so it always has room of its own below the copy. */}
        <div
          ref={cueBoxRef}
          className="pointer-events-none mt-8 flex shrink-0 justify-center"
        >
          <div
            ref={cueRef}
            className="flex flex-col items-center gap-2.5 will-change-transform"
          >
            <span className="hero-swap font-inter text-[10px] font-medium uppercase tracking-[0.22em] text-(--ink) opacity-55 lg:text-[11px]">
              Scroll down to shop your favourite gadgets
            </span>
            <ChevronDown
              className="hero-swap animate-scroll-cue h-5 w-5 text-(--ink)"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
