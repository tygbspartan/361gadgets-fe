"use client";

import { useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import {
  BOARD_Y,
  HALF_W,
  HERO_BOOT_KEY,
  NODES,
  PARK_NODE,
  PULSES,
  TRACES,
  drawOrder,
} from "@/components/home/heroCircuit";
import { PageReadyContext } from "@/components/providers/LoadingProvider";

/*
 * The hero's stage: a circuit board that draws itself in on first load, then
 * idles with a few travelling pulses and a crimson spotlight that follows the
 * cursor (or wanders on its own when there is no cursor to follow).
 *
 * The copy is passed in as children so it stays out of this client component.
 * All boot timing lives in globals.css; this component only sets per-element
 * delays and drives the spotlight position.
 */

const LAST = TRACES.length - 1;

/* Lissajous wander for the spotlight when no pointer is over the hero. */
const WANDER_SPEED = 1.1; /* t units per second */
/* Per-second approach rate toward the target; higher = snappier. Smooths the
   hand-off between wandering and following, which would otherwise jump. */
const FOLLOW = 14;
const WANDER = 4;

/* When the last boot started, so a remount moments later (React StrictMode in
   dev) isn't mistaken for a return visit and cut the animation short. */
let bootStartedAt = 0;

type Side = "left" | "right";
const onSide = (side: Side, trace: number) => (trace < TRACES.length / 2) === (side === "left");

/*
 * One half of the board. Each half is fitted (meet, not slice) inside the
 * padded .hero-board box and pinned to its own edge, so the traces always run
 * in from the screen edge while the whole board stays clear of the hero's top
 * and bottom. A single slice-scaled board would be cropped top and bottom on
 * wide screens, pushing traces against both edges.
 */
function Half({ side, spotlight = false }: { side: Side; spotlight?: boolean }) {
  const traces = TRACES.map((d, i) => ({ d, i })).filter(({ i }) => onSide(side, i));
  const nodes = NODES.map((n, i) => ({ ...n, i })).filter((n) => onSide(side, n.trace));

  return (
    <svg
      aria-hidden="true"
      viewBox={`${side === "left" ? 0 : HALF_W} ${BOARD_Y.top} ${HALF_W} ${BOARD_Y.height}`}
      preserveAspectRatio={side === "left" ? "xMinYMid meet" : "xMaxYMid meet"}
      className="hero-board pointer-events-none absolute inset-x-0"
    >
      {spotlight ? (
        <>
          <g fill="none" stroke="var(--hero-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {traces.map(({ d }) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g fill="var(--hero-accent)">
            {nodes.map(({ x, y }) => (
              <circle key={`${x},${y}`} cx={x} cy={y} r="7" />
            ))}
          </g>
        </>
      ) : (
        <>
          <g fill="none" stroke="#E3E3E3" strokeWidth="1.5">
            {traces.map(({ d, i }) => (
              <path
                key={d}
                d={d}
                pathLength={100}
                className="hero-boot hero-trace"
                style={{ animationDelay: `${(0.1 + (0.8 * drawOrder(i)) / LAST).toFixed(3)}s` }}
              />
            ))}
          </g>
          <g className="hero-boot hero-idle hero-pulses" fill="none" stroke="#C9C9C9" strokeWidth="2">
            {PULSES.filter(({ trace }) => onSide(side, trace)).map(({ trace, delay }) => (
              <path
                key={trace}
                d={TRACES[trace]}
                pathLength={100}
                className="hero-pulse"
                style={{ animationDelay: delay }}
              />
            ))}
          </g>
          <g fill="#FAFAFA" stroke="#D6D6D6" strokeWidth="1.5">
            {nodes.map(({ x, y, trace, i }) => (
              <circle
                key={`${x},${y}`}
                cx={x}
                cy={y}
                r="5"
                data-park={i === PARK_NODE ? "" : undefined}
                className="hero-boot hero-node"
                style={{ animationDelay: `${(1.15 + (0.8 * drawOrder(trace)) / LAST).toFixed(3)}s` }}
              />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}

export default function HeroStage({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  /* The boot is held (animations paused on frame 0) while the PageLoader
     overlay covers the page, so it plays when there's someone to see it. */
  const pageReady = useContext(PageReadyContext);

  /* Boot once per session. Layout effect so a client-side return to the
     homepage lands on the finished state before the first paint. */
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    try {
      if (sessionStorage.getItem(HERO_BOOT_KEY) && performance.now() - bootStartedAt > 2500) {
        el.dataset.booted = "";
      }
    } catch {
      /* Storage blocked: the boot just plays every visit. */
    }
  }, []);

  /* Only count the boot as seen once it has actually started playing. */
  useEffect(() => {
    if (!pageReady) return;
    try {
      if (!sessionStorage.getItem(HERO_BOOT_KEY)) {
        sessionStorage.setItem(HERO_BOOT_KEY, "1");
        bootStartedAt = performance.now();
      }
    } catch {
      /* Storage blocked: the boot just plays every visit. */
    }
  }, [pageReady]);

  /* Spotlight position. Written straight to CSS custom properties from a rAF
     loop — never React state, so pointer movement causes no re-renders. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;

    let w = el.clientWidth;
    let h = el.clientHeight;
    const setSpot = (x: number, y: number) => {
      el.style.setProperty("--mx", `${x.toFixed(1)}px`);
      el.style.setProperty("--my", `${y.toFixed(1)}px`);
    };

    /* Reduced motion: park on the upper-left node cluster. Measured from the
       rendered node rather than recomputed, so it follows the board's fit. */
    const park = () => {
      const node = el.querySelector("[data-park]");
      if (!node) return;
      const n = node.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setSpot(n.left + n.width / 2 - r.left, n.top + n.height / 2 - r.top);
    };

    const ro = new ResizeObserver(() => {
      w = el.clientWidth;
      h = el.clientHeight;
      if (reduced) park();
    });
    ro.observe(el);

    if (reduced) {
      park();
      return () => ro.disconnect();
    }

    let x = w * 0.5;
    let y = h * 0.48;
    let t = 0;
    let last = 0;
    let raf = 0;
    let hovering = false;
    let clientX = 0;
    let clientY = 0;
    let onScreen = false;

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      let tx: number;
      let ty: number;
      if (hovering) {
        /* Read before writing, once per frame, so the style write below never
           forces a synchronous layout. */
        const r = el.getBoundingClientRect();
        tx = clientX - r.left;
        ty = clientY - r.top;
      } else {
        t += dt * WANDER_SPEED;
        tx = w * (0.5 + 0.38 * Math.sin(t * 0.7));
        ty = h * (0.48 + 0.32 * Math.sin(t * 1.1));
      }

      const k = Math.min(1, dt * (hovering ? FOLLOW : WANDER));
      x += (tx - x) * k;
      y += (ty - y) * k;
      setSpot(x, y);

      raf = requestAnimationFrame(frame);
    };

    const sync = () => {
      const run = onScreen && !document.hidden;
      if (run && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    setSpot(x, y);

    /* Touch / (hover: none) devices stay in wander mode: their pointermoves
       are scroll gestures, not a cursor to follow. */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      hovering = true;
      clientX = e.clientX;
      clientY = e.clientY;
    };
    const onLeave = () => {
      hovering = false;
    };
    if (canHover) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    /* min-height in CSS, so the space is reserved before any script runs.
       Screen minus navbar, plus --hero-overlap: the brand strip below is
       pulled up over the hero by that much, and without adding it back the
       strip would poke into the first screen as a white band. */
    <section
      ref={sectionRef}
      data-boot-held={pageReady ? undefined : ""}
      className="hero relative isolate flex min-h-[calc(100svh-var(--nav-h)+var(--hero-overlap))] flex-col overflow-hidden bg-[#FAFAFA]"
    >
      <Half side="left" />
      <Half side="right" />
      {/* The mask sits on a hero-sized wrapper so --mx/--my (section-relative
          px) line up with the cursor regardless of where the halves land. */}
      <div aria-hidden="true" className="hero-boot hero-idle hero-spot pointer-events-none absolute inset-0">
        <Half side="left" spotlight />
        <Half side="right" spotlight />
      </div>

      {/* Boot scan: the wrapper spans the hero and slides one hero-width, so
          the bar at its left edge sweeps edge to edge. */}
      <div aria-hidden="true" className="hero-boot hero-scan pointer-events-none absolute inset-0">
        <div className="h-full w-0.5 bg-(--hero-accent) shadow-[0_0_24px_var(--hero-accent)]" />
      </div>

      {children}
    </section>
  );
}
