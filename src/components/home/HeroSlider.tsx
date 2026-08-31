"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetHeroImagesQuery } from "@/lib/redux/features/hero/heroApi";
import Spinner from "@/components/ui/Spinner";
import HeroFallback from "@/components/home/HeroFallback";
import { useParallax } from "@/hooks/useParallax";

/* Full-bleed and full-height: no radius, border or shadow, since all three read
   as mistakes on an element that runs to the screen edges.
   `svh` rather than `dvh` deliberately — dvh changes as mobile browser chrome
   hides, which would resize the stage mid-scroll and make the parallax jitter. */
const STAGE = "relative w-full h-svh overflow-hidden bg-gray-100";

/* The banner is the middle plane: it lags the scroll less than the backdrop grid
   behind it, and less than the trust strip in front leads it.
   This is the one layer whose depth costs something — see OVERSCAN. */
const BANNER_DEPTH = 160;
/* Vertical overscan on the image layer. Must exceed BANNER_DEPTH / 2 (80px) or
   the layer's edge slides into view at the extremes of the travel.
   The trade-off is real: the layer is 192px taller than the stage, and
   `object-cover` pays for that by scaling the artwork up and cropping its
   left/right edges. Raising BANNER_DEPTH means raising this too, and cropping
   the banner further — see the note in the handover about the 3.2:1 artwork. */
const OVERSCAN = "-top-24 -bottom-24"; /* 96px each side vs. 80px of travel */

export default function HeroSlider() {
  const { data, isLoading } = useGetHeroImagesQuery();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { containerRef, layerRef } = useParallax<HTMLDivElement, HTMLDivElement>(
    BANNER_DEPTH,
  );

  const slides = data?.data ?? [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) return <Spinner className="h-svh" />;
  // Never leave the top of the homepage empty — fall back to branded copy.
  if (slides.length === 0) return <HeroFallback />;

  // Single slide — static banner, no controls.
  if (slides.length === 1) {
    const slide = slides[0];
    const inner = (
      <div ref={containerRef} className={STAGE}>
        <div className={`absolute inset-x-0 ${OVERSCAN} will-change-transform`} ref={layerRef}>
          <Image
            src={slide.imageUrl}
            alt={slide.altText ?? "Banner"}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </div>
    );
    return slide.linkUrl ? (
      <Link href={slide.linkUrl}>{inner}</Link>
    ) : (
      inner
    );
  }

  const goToPrevious = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div ref={containerRef} className={`${STAGE} group`}>
        {/* Only the slide stack parallaxes — arrows and dots stay pinned to the
            frame, so the controls don't drift away from the pointer. */}
        <div className={`absolute inset-x-0 ${OVERSCAN} will-change-transform`} ref={layerRef}>
          {slides.map((slide, index) => {
            const inner = (
              <div className="relative w-full h-full">
                <Image
                  src={slide.imageUrl}
                  alt={slide.altText ?? "Banner"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  unoptimized
                />
              </div>
            );

            return slide.linkUrl ? (
              <Link
                key={slide.id}
                href={slide.linkUrl}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                {inner}
              </div>
            );
          })}
        </div>

        <button
          onClick={goToPrevious}
          aria-label="Previous slide"
          className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 rounded-full glass border border-(--hairline) text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:border-(--hairline-strong) hover:text-primary hover:shadow-(--elev-2)"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 rounded-full glass border border-(--hairline) text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:border-(--hairline-strong) hover:text-primary hover:shadow-(--elev-2)"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots sit on a glass pill: banner artwork can be any brightness, so
            the pill guarantees the dark dots stay legible over all of it. */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full glass px-2.5 py-1.5 shadow-(--elev-1)">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-black/25 hover:bg-black/50"
              }`}
            />
          ))}
        </div>
    </div>
  );
}
