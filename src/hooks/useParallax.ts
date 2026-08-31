"use client";

import { useEffect, useState } from "react";

/*
 * Scroll parallax for a layer inside a container.
 *
 * Every registered layer shares one scroll listener and one rAF, so all layers
 * are written in the same frame. With a listener each they could be updated a
 * frame apart, and the depth illusion breaks the moment two planes disagree
 * about where the scroll position is.
 *
 * Transforms are written straight to the node — driving them through state
 * would re-render the subtree on every scroll event.
 */

type Updater = () => void;

const updaters = new Set<Updater>();
let raf = 0;
let listening = false;

const runAll = () => {
  raf = 0;
  updaters.forEach((fn) => fn());
};

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(runAll);
};

const startListening = () => {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
};

const stopListeningIfIdle = () => {
  if (updaters.size > 0 || !listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
};

/*
 * Both public hooks share this one implementation so they also share the single
 * rAF above — a fade and a parallax updated in different frames would visibly
 * disagree with each other.
 *
 * Parameters are plain numbers rather than callbacks on purpose: numbers are
 * stable across renders, so they can sit in the effect's dependency array
 * without needing refs-assigned-during-render (which trips react-hooks).
 *
 *   distance  0 -> no transform. Otherwise total px of vertical travel.
 *   fadeOutBy 0 -> no fade. Otherwise the progress value (0-1) at which the
 *                  layer should have reached full transparency.
 *   publishBy 0 -> nothing published. Otherwise progress is normalised so it
 *                  reaches 1 at that value and written to `--p` on the layer,
 *                  for effects CSS can drive itself (clip-path, gradients).
 */
function useScrollDriven<
  C extends HTMLElement = HTMLDivElement,
  L extends HTMLElement = HTMLDivElement,
>(distance: number, fadeOutBy: number, publishBy = 0) {
  /*
   * Callback refs, not object refs: callers render the layer behind a loading
   * or empty state, so the node can appear on a later render than the one that
   * first ran this effect. Tracking the node in state re-runs setup when it
   * actually attaches, and tears down when it goes away.
   */
  const [container, setContainer] = useState<C | null>(null);
  const [layer, setLayer] = useState<L | null>(null);

  useEffect(() => {
    if (!container || !layer) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let visible = false;

    const update = () => {
      if (!visible) return;
      const viewport = window.innerHeight;
      const scrolled = window.scrollY;
      const rect = container.getBoundingClientRect();
      const docTop = rect.top + scrolled;

      /*
       * Progress is measured over the scroll range the document can actually
       * reach, not the idealised "enters the bottom, exits the top" pass.
       *
       * That distinction matters: a hero at the top of the page is already
       * on screen at scroll 0, so the idealised range starts it near 0.5 and
       * half the travel is unreachable — the layer moves half as far as its
       * `distance` claims. Clamping the ends to real scroll positions means
       * every element uses its full range wherever it sits on the page.
       */
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - viewport,
      );
      const start = Math.max(0, docTop - viewport);
      const end = Math.min(docTop + rect.height, maxScroll);
      const span = end - start;
      if (span <= 0) return;

      const progress = Math.min(Math.max((scrolled - start) / span, 0), 1);

      if (distance !== 0) {
        const y = (progress - 0.5) * distance;
        layer.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
      }
      if (fadeOutBy > 0) {
        const o = Math.min(Math.max(1 - progress / fadeOutBy, 0), 1);
        layer.style.opacity = o.toFixed(3);
      }
      if (publishBy > 0) {
        const q = Math.min(Math.max(progress / publishBy, 0), 1);
        layer.style.setProperty("--p", q.toFixed(4));
      }
    };

    const clear = () => {
      layer.style.transform = "";
      layer.style.opacity = "";
      layer.style.removeProperty("--p");
    };

    // Registered/unregistered as the user's motion preference changes, so the
    // effect doesn't need to re-run to honour a mid-session toggle.
    const sync = () => {
      if (motionQuery.matches) {
        updaters.delete(update);
        stopListeningIfIdle();
        clear();
      } else {
        updaters.add(update);
        startListening();
        update();
      }
    };

    // Only the visible container does work; offscreen heroes cost nothing.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) update();
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(container);

    sync();
    motionQuery.addEventListener("change", sync);

    return () => {
      io.disconnect();
      motionQuery.removeEventListener("change", sync);
      updaters.delete(update);
      stopListeningIfIdle();
      clear();
    };
  }, [container, layer, distance, fadeOutBy, publishBy]);

  return { containerRef: setContainer, layerRef: setLayer };
}

/**
 * `distance` is the layer's total vertical travel in px across a full pass
 * through the viewport, split evenly either side of its resting position.
 *
 *   positive -> the layer lags the scroll, reading as *further away*
 *   negative -> the layer leads the scroll, reading as *nearer*
 *
 * The container must clip (or the layer must be inset by at least
 * `distance / 2`) or the layer's edges will show at the extremes.
 */
export function useParallax<
  C extends HTMLElement = HTMLDivElement,
  L extends HTMLElement = HTMLDivElement,
>(distance: number) {
  return useScrollDriven<C, L>(distance, 0);
}

/**
 * Fades the layer out as its container scrolls away.
 *
 * `fadeOutBy` is the scroll progress (0-1 across the container's pass) at which
 * the layer should be fully transparent — 0.55 means gone a little past
 * halfway, rather than lingering until the container has fully left.
 */
export function useScrollFade<
  C extends HTMLElement = HTMLDivElement,
  L extends HTMLElement = HTMLDivElement,
>(fadeOutBy = 0.55) {
  return useScrollDriven<C, L>(0, fadeOutBy);
}

/**
 * Both at once, on a single element. Needed where a layer has to drift *and*
 * fade — using useParallax and useScrollFade together would mean two container
 * refs competing for the same node.
 */
export function useParallaxFade<
  C extends HTMLElement = HTMLDivElement,
  L extends HTMLElement = HTMLDivElement,
>(distance: number, fadeOutBy: number) {
  return useScrollDriven<C, L>(distance, fadeOutBy);
}

/**
 * Publishes scroll progress as `--p` (0-1) on the layer, reaching 1 at
 * `completeBy`. For effects that are better expressed in CSS than in JS —
 * a clip-path wipe, a gradient stop, a rotation.
 */
export function useScrollProgress<
  C extends HTMLElement = HTMLDivElement,
  L extends HTMLElement = HTMLDivElement,
>(completeBy = 1) {
  return useScrollDriven<C, L>(0, 0, completeBy);
}
