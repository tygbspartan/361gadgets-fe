"use client";

import { useId } from "react";

/*
 * Tiling PCB artwork: right-angle traces with 45° jogs, via dots and a couple
 * of pads. Drawn with `currentColor` so the caller sets tone with a text-*
 * class and strength with opacity.
 *
 * Rendered twice in the hero (a faint always-on copy and a bright copy revealed
 * by the cursor torch), hence useId — two <pattern> elements with the same id
 * in one document is invalid, and the second would silently reference the first.
 */
export default function CircuitTraces({ className }: { className?: string }) {
  /* Keep only characters that are safe inside url(#...), rather than stripping
     one known delimiter: React 18 emitted `:r0:` and React 19 emits `_R_1_`.
     Underscores and hyphens are kept so distinct ids can't collapse into the
     same string and collide across the two instances rendered below. */
  const id = `ct${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      aria-hidden
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width="240"
          height="240"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M0 48 H72 l24 -24 H168 l24 24 H240" />
            <path d="M0 168 H48 l28 28 H240" />
            <path d="M96 0 V72 l24 24 V168" />
            <path d="M192 240 V180 l-28 -28 V96" />
            <path d="M120 96 H176" />
            <path d="M0 108 H36 l16 -16 H88" />
          </g>

          {/* Vias */}
          <g fill="currentColor">
            <circle cx="72" cy="48" r="3.5" />
            <circle cx="96" cy="96" r="3.5" />
            <circle cx="192" cy="72" r="3.5" />
            <circle cx="164" cy="152" r="3.5" />
            <circle cx="48" cy="168" r="3.5" />
          </g>

          {/* Pads */}
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="140" y="36" width="26" height="16" rx="2" />
            <rect x="28" y="196" width="20" height="20" rx="2" />
          </g>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
