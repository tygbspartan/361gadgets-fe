"use client";

import { useEffect, useRef } from "react";

/*
 * LED dot matrix. A regular field of dots that swell and darken under the
 * cursor, like a panel lighting up beneath your hand.
 *
 * Canvas rather than DOM: a full-screen hero at this pitch is ~2,800 dots, and
 * that many elements would neither lay out nor animate at 60fps.
 *
 * The resting field is drawn once into an offscreen canvas and blitted each
 * frame, so per-frame work is only the ~170 dots actually within the cursor's
 * influence rather than all 2,800.
 */

const PITCH = 26; /* px between dot centres */
const BASE_R = 1.0; /* resting radius */
const PEAK_R = 2.9; /* radius directly under the cursor */
const BASE_A = 0.1; /* resting alpha */
const PEAK_A = 0.6; /* alpha directly under the cursor */
const REACH = 170; /* px radius of the cursor's influence */
const EASE = 0.16; /* per-frame approach rate for the influence scalar */

export default function LedMatrix({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Direct manipulation is fine under reduced motion; the eased settle is
       not, so that gets snapped instead. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* No cursor to follow on touch — those devices get the static field, which
       reads as a perf-board texture on its own. */
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    const base = document.createElement("canvas");
    const baseCtx = base.getContext("2d");
    if (!baseCtx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let colour = "rgb(17,17,17)";

    let raf = 0;
    let influence = 0; /* eased 0..1 */
    let target = 0;
    let px = -9999;
    let py = -9999;
    let clientX = -9999;
    let clientY = -9999;

    const dot = (c: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) => {
      c.globalAlpha = a;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    };

    /* The resting field, rendered once per resize. */
    const paintBase = () => {
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseCtx.clearRect(0, 0, w, h);
      baseCtx.fillStyle = colour;
      for (let y = PITCH / 2; y < h; y += PITCH) {
        for (let x = PITCH / 2; x < w; x += PITCH) {
          dot(baseCtx, x, y, BASE_R, BASE_A);
        }
      }
      baseCtx.globalAlpha = 1;
    };

    const paintIdle = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, base.width, base.height);
      ctx.drawImage(base, 0, 0);
    };

    const frame = () => {
      raf = 0;

      influence += reduced.matches
        ? target - influence
        : (target - influence) * EASE;
      if (Math.abs(target - influence) < 0.005) influence = target;

      /* Blit the resting field, then overdraw only the lit neighbourhood. */
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, base.width, base.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = colour;

      if (influence > 0.001) {
        /* Snap the neighbourhood to the dot lattice so we iterate only over
           cells that exist, instead of scanning the whole field. */
        const x0 = Math.max(PITCH / 2, Math.floor((px - REACH) / PITCH) * PITCH + PITCH / 2);
        const x1 = Math.min(w, px + REACH);
        const y0 = Math.max(PITCH / 2, Math.floor((py - REACH) / PITCH) * PITCH + PITCH / 2);
        const y1 = Math.min(h, py + REACH);

        for (let y = y0; y < y1; y += PITCH) {
          for (let x = x0; x < x1; x += PITCH) {
            const d = Math.hypot(x - px, y - py);
            if (d >= REACH) continue;
            const f = (1 - d / REACH) ** 2 * influence;
            dot(ctx, x, y, BASE_R + (PEAK_R - BASE_R) * f, BASE_A + (PEAK_A - BASE_A) * f);
          }
        }
      }
      ctx.globalAlpha = 1;

      /* Keep going only while there is something left to animate. The frame
         above already left the canvas in its resting state, so there is nothing
         further to paint when we stop. */
      if (influence > 0.001 || target > 0) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    /* Re-derive canvas-local coords from the last known viewport position.
       Needed on scroll as well as on move: the canvas slides under a stationary
       cursor, and without this the lit patch would travel with the hero instead
       of staying put under the pointer. */
    const reproject = () => {
      const r = canvas.getBoundingClientRect();
      px = clientX - r.left;
      py = clientY - r.top;
      target = px >= 0 && px <= r.width && py >= 0 && py <= r.height ? 1 : 0;
    };

    const onMove = (e: PointerEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      reproject();
      start();
    };

    const onScroll = () => {
      if (target === 0 && influence === 0) return;
      reproject();
      start();
    };

    /* The cursor can leave the window without ever reporting a position outside
       the canvas — the hero is full-bleed, so its last move is at the very edge.
       Without this the field would stay lit and the rAF would never stop. */
    const onLeaveWindow = () => {
      target = 0;
      start();
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = base.width = Math.round(w * dpr);
      canvas.height = base.height = Math.round(h * dpr);
      colour = getComputedStyle(canvas).color || colour;
      paintBase();
      if (raf) return;
      paintIdle();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (fine.matches) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("pointerleave", onLeaveWindow);
      window.addEventListener("blur", onLeaveWindow);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("blur", onLeaveWindow);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
