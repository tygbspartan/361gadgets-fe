"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

/*
 * Auto-drifting brand marquee that can also be grabbed and flung.
 *
 * The old CSS keyframe version couldn't work here: a running animation owns the
 * element's transform, so there's no way to add a drag offset on top of it.
 * Instead a requestAnimationFrame loop owns `translate3d`, and the pointer
 * handlers feed the same offset — keeping drift and drag on one continuous value.
 *
 * The offset is written straight to the DOM node rather than through state; at
 * 60fps a state update per frame would re-render the whole list.
 */

/** Baseline drift in px/ms (negative = leftward). ~50px/s, matching the old 25s marquee. */
const DRIFT = -0.05;
/** Per-ms exponential pull of the current velocity back toward DRIFT after a fling. */
const DECAY = 0.994;
/** Pointer travel in px past which the gesture counts as a drag, not a click. */
const DRAG_SLOP = 6;
/** Cap on fling speed, px/ms, so a fast swipe can't tear the strip. */
const MAX_VELOCITY = 3;

export default function BrandsCarousel() {
  const { data: brandsData } = useGetBrandsQuery();
  const brands = (brandsData?.data ?? []).filter((b) => b.logoUrl && b.isActive);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  const offset = useRef(0);
  const velocity = useRef(DRIFT);
  const setWidth = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const travelled = useRef(0);
  /** Set on release after a real drag, so the click it produces can be swallowed. */
  const didDrag = useRef(false);
  /** Pauses the drift while the pointer is over the strip, so a logo can be
      hovered and clicked without chasing it. */
  const hovered = useRef(false);

  /*
   * One set is rendered `copies` times. We need enough to cover the viewport
   * plus a full spare set, otherwise the wrap point shows as a gap when there
   * are only a few brands on a wide screen.
   */
  const [copies, setCopies] = useState(2);

  const measure = useCallback(() => {
    const w = setRef.current?.offsetWidth ?? 0;
    const vw = viewportRef.current?.offsetWidth ?? 0;
    if (w <= 0) return;
    setWidth.current = w;
    setCopies(Math.max(2, Math.ceil(vw / w) + 1));
  }, []);

  // Re-measure on resize and as logos load, since both change the set width.
  useEffect(() => {
    if (brands.length === 0) return;
    measure();
    const ro = new ResizeObserver(measure);
    // Deliberately not observing the track: adding copies changes its width,
    // which would feed back into measure() and loop.
    if (setRef.current) ro.observe(setRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [brands.length, measure]);

  useEffect(() => {
    if (brands.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let prev = performance.now();

    const frame = (now: number) => {
      // Clamp dt so returning to a backgrounded tab doesn't jump the strip.
      const dt = Math.min(now - prev, 50);
      prev = now;

      if (!dragging.current) {
        // Hover parks the target at zero, so the strip eases to a stop and eases
        // back up again on exit — the same formula that handles fling decay,
        // rather than a hard stop.
        const base = reduced.matches || hovered.current ? 0 : DRIFT;
        // One formula covers fling decay, hover pause and steady drift:
        // velocity eases toward `base`, passing through zero naturally.
        velocity.current = base + (velocity.current - base) * Math.pow(DECAY, dt);
        offset.current += velocity.current * dt;
      }

      const w = setWidth.current;
      if (w > 0) {
        // Normalise into (-w, 0] so the transform never grows without bound.
        let o = offset.current % w;
        if (o > 0) o -= w;
        offset.current = o;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offset.current}px,0,0)`;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [brands.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Primary button / touch / pen only — ignore right- and middle-click.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging.current = true;
    didDrag.current = false;
    travelled.current = 0;
    velocity.current = 0;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - lastX.current;
    const dt = Math.max(now - lastT.current, 1);

    offset.current += dx;
    travelled.current += Math.abs(dx);
    velocity.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, dx / dt));

    lastX.current = e.clientX;
    lastT.current = now;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    // Past the slop threshold this was a swipe, so the ensuing click on whichever
    // logo sat under the pointer must not navigate.
    didDrag.current = travelled.current > DRAG_SLOP;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!didDrag.current) return;
    e.preventDefault();
    e.stopPropagation();
    didDrag.current = false;
  };

  if (brands.length === 0) return null;

  return (
    <div
      ref={viewportRef}
      /*
       * Rides up over the hero on a rounded top edge with an upward shadow, so
       * the strip reads as a separate sheet rather than more hero. The hero
       * adds --hero-overlap back to its own height to compensate, keeping the
       * two exactly one screen between them.
       */
      className="relative z-10 -mt-(--hero-overlap) w-full overflow-hidden rounded-t-[28px] border-t border-(--hairline) bg-background pt-9 pb-5 lg:pt-11 lg:pb-7 shadow-[0_-10px_30px_-14px_rgb(0_0_0/0.18)] select-none touch-pan-y cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => (hovered.current = true)}
      /* Only the hover flag: an in-progress drag holds pointer capture, so its
         pointerup still lands here even once the cursor has left. */
      onPointerLeave={() => (hovered.current = false)}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {Array.from({ length: copies }).map((_, copy) => (
          <div
            key={copy}
            ref={copy === 0 ? setRef : undefined}
            /* Trailing padding stands in for the gap between one set and the
               next, so the measured width tiles seamlessly. */
            className="flex shrink-0 items-center gap-10 pr-10 lg:gap-20 lg:pr-20"
            aria-hidden={copy > 0}
          >
            {brands.map((brand) => (
              <Link
                key={`${copy}-${brand.id}`}
                href={`${ROUTES.PRODUCTS}?brand=${brand.slug}`}
                /* Only the first set is reachable by keyboard; the rest are
                   duplicates that would otherwise triple the tab stops. */
                tabIndex={copy > 0 ? -1 : undefined}
                /* Desaturated at rest, full colour and slightly larger on
                   hover. Scaling the link rather than the image keeps the
                   growth centred and out of the layout, so neighbours don't
                   shift and the measured set width stays correct.
                   The transition names `scale`, not `transform`: Tailwind v4
                   compiles scale-110 to the `scale` property, so listing
                   `transform` would leave the size change un-animated. */
                className="shrink-0 flex items-center justify-center w-21.75 h-12.5 md:w-27.5 md:h-17.5 lg:w-38.75 lg:h-22.5 grayscale opacity-80 transition-[filter,opacity,scale] duration-300 ease-out hover:grayscale-0 hover:opacity-100 hover:scale-110"
              >
                <Image
                  src={brand.logoUrl!}
                  alt={brand.name}
                  width={155}
                  height={90}
                  draggable={false}
                  onLoad={measure}
                  className="object-contain w-21.75 h-12.5 md:w-27.5 md:h-17.5 lg:w-38.75 lg:h-22.5 pointer-events-none"
                  unoptimized
                />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
