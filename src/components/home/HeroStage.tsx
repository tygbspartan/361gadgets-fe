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
 * One half of the board. Each half is fitted (meet, not slice) inside its
 * .hero-board box and pinned to its own edge, so the traces always run in from
 * the screen edge. Where the boxes go per screen size is in globals.css.
 */
function Half({ side, spotlight = false }: { side: Side; spotlight?: boolean }) {
  const traces = TRACES.map((d, i) => ({ d, i })).filter(({ i }) => onSide(side, i));
  const nodes = NODES.map((n, i) => ({ ...n, i })).filter((n) => onSide(side, n.trace));

  return (
    <svg
      aria-hidden="true"
      viewBox={`${side === "left" ? 0 : HALF_W} ${BOARD_Y.top} ${HALF_W} ${BOARD_Y.height}`}
      preserveAspectRatio={side === "left" ? "xMinYMid meet" : "xMaxYMid meet"}
      className={`hero-board hero-board-${side} pointer-events-none absolute`}
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
          <g fill="none" stroke="var(--hero-trace)" strokeWidth="1.5">
            {traces.map(({ d, i }) => (
              <path
                key={d}
                d={d}
                pathLength={100}
                className="hero-boot hero-trace"
                style={{ animationDelay: `${(0.05 + (0.5 * drawOrder(i)) / LAST).toFixed(3)}s` }}
              />
            ))}
          </g>
          <g className="hero-boot hero-idle hero-pulses" fill="none" stroke="var(--hero-pulse)" strokeWidth="2">
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
          <g fill="var(--hero-bg)" stroke="var(--hero-node)" strokeWidth="1.5">
            {nodes.map(({ x, y, trace, i }) => (
              <circle
                key={`${x},${y}`}
                cx={x}
                cy={y}
                r="5"
                data-park={i === PARK_NODE ? "" : undefined}
                className="hero-boot hero-node"
                style={{ animationDelay: `${(0.55 + (0.5 * drawOrder(trace)) / LAST).toFixed(3)}s` }}
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
  /* The board and its spotlight, moved together by the scroll parallax. */
  const depthRef = useRef<HTMLDivElement>(null);
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

    /* --mx/--my are relative to the depth layer the mask sits in, which the
       parallax shifts away from the section as the page scrolls. */
    const layerRect = () => (depthRef.current ?? el).getBoundingClientRect();

    /* Reduced motion: park on the upper-left node cluster. Measured from the
       rendered node rather than recomputed, so it follows the board's fit. */
    const park = () => {
      const node = el.querySelector("[data-park]");
      if (!node) return;
      const n = node.getBoundingClientRect();
      const r = layerRect();
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
        const r = layerRect();
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

  /* Clear zone: report the copy's box (everything marked data-hero-clear) to
     the CSS mask on .hero-depth, which keeps the board off it. Offsets rather
     than getBoundingClientRect, so the boot's slide-in transforms and the
     scroll position don't skew the measurement. */
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const parts = [...el.querySelectorAll<HTMLElement>("[data-hero-clear]")];
    if (parts.length === 0) return;

    const boxOf = (node: HTMLElement) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = node;
      while (n && n !== el) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { l: x, t: y, r: x + node.offsetWidth, b: y + node.offsetHeight };
    };
    const measure = () => {
      const boxes = parts.map(boxOf);
      el.style.setProperty("--cl", `${Math.min(...boxes.map((b) => b.l))}px`);
      el.style.setProperty("--cr", `${Math.max(...boxes.map((b) => b.r))}px`);
      el.style.setProperty("--ct", `${Math.min(...boxes.map((b) => b.t))}px`);
      el.style.setProperty("--cb", `${Math.max(...boxes.map((b) => b.b))}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    parts.forEach((p) => ro.observe(p));
    /* Web fonts can change the headline's width after first paint. */
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  /* Scroll depth: the board drifts up at half speed, so it reads as sitting
     behind the copy, and the copy fades as the hero scrolls away. Like the
     spotlight, only CSS custom properties are written here; the transform
     and fade themselves are .hero-depth / .hero-copy in globals.css. The hero
     is the top of the page, so window.scrollY is how far past it we are. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let height = el.offsetHeight;
    let raf = 0;
    const update = () => {
      raf = 0;
      const scrolled = Math.min(Math.max(window.scrollY, 0), height);
      el.style.setProperty("--hero-sy", scrolled.toFixed(1));
      el.style.setProperty("--hero-p", (scrolled / height).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(() => {
      height = el.offsetHeight || 1;
      onScroll();
    });
    ro.observe(el);

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
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
      className="hero relative isolate flex min-h-[calc(100svh-var(--nav-h)+var(--hero-overlap))] flex-col overflow-hidden bg-(--hero-bg)"
    >
      <div ref={depthRef} aria-hidden="true" className="hero-depth pointer-events-none absolute inset-0">
        <Half side="left" />
        <Half side="right" />
        {/* The mask sits on a layer-sized wrapper so --mx/--my (layer-relative
            px) line up with the cursor regardless of where the halves land. */}
        <div className="hero-boot hero-idle hero-spot absolute inset-0">
          <Half side="left" spotlight />
          <Half side="right" spotlight />
        </div>
      </div>

      {children}
    </section>
  );
}
