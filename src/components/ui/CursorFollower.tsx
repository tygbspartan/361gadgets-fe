"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * A small crimson square that tails the mouse and doubles as a guide to what can
 * be done:
 *   • at rest it sits on the tip of the pointer and follows with a lag — move
 *     fast and it trails like a tail, then catches up;
 *   • over anything marked `data-cursor="Word"` it drops below the pointer and
 *     widens into a tag with that word in it ("View", "Drag", "Explore"…);
 *   • over an icon-only button or link (no visible text) it shows that
 *     control's aria-label instead — so "Search", "Share", "Account"… come for
 *     free from markup that is already there for screen readers;
 *   • over other links and buttons it opens into a see-through ring around
 *     the pointer;
 *   • over a disabled control it says why it's disabled — set the reason with
 *     `data-cursor-disabled="Out of stock"` (falls back to "Unavailable");
 *   • over text fields it disappears, so it doesn't get in the way of typing;
 *   • when the mouse leaves the page it waits at the edge where it went out.
 * The real pointer is never hidden — the square is always behind it.
 *
 * Only for a real mouse: touch screens have no pointer to follow, and visitors
 * who ask for reduced motion don't get it at all.
 *
 * To label an element, add the attribute — nothing else is needed:
 *   <Link data-cursor="View" …>
 *   <button disabled={isOOS} data-cursor-disabled="Out of stock" …>
 */

type Mode = "idle" | "link" | "label" | "hidden";

const LINK_SELECTOR =
  "a, button, summary, label, [role='button'], [role='tab'], [role='menuitem'], [role='option'], [role='checkbox'], [role='radio'], input[type='checkbox'], input[type='radio']";
const FIELD_SELECTOR =
  "input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='button']):not([type='submit']), textarea, select, [contenteditable='true']";

const EASE = 0.16; /* share of the remaining distance covered each frame — lower = longer tail */
const EDGE_INSET = 9; /* how far inside the window it waits when the mouse leaves (keeps it fully visible) */
const TAG_GAP = 8; /* min space kept between a tag and the window edge */
const TAG_H = 22; /* h-5.5 */
const TAG_PAD_X = 16; /* px-2 on both sides */

const isDisabled = (el: Element) =>
  (el as HTMLButtonElement).disabled === true || el.getAttribute("aria-disabled") === "true";

/** What the follower should do over `target`. */
function resolve(target: Element | null): { mode: Mode; label: string } {
  if (!target) return { mode: "idle", label: "" };

  // Disabled: say why, so a greyed-out button isn't a dead end. The reason
  // comes from `data-cursor-disabled` on the control, else its own tag.
  const control = target.closest<HTMLElement>(LINK_SELECTOR);
  if (control && isDisabled(control)) {
    const reason = control.dataset.cursorDisabled || control.dataset.cursor || "Unavailable";
    return { mode: "label", label: reason };
  }

  const labelled = target.closest<HTMLElement>("[data-cursor]");
  if (labelled?.dataset.cursor) return { mode: "label", label: labelled.dataset.cursor };

  if (target.closest(FIELD_SELECTOR)) return { mode: "hidden", label: "" };

  if (!control) {
    // Clickable divs and the like: anything the page styles with a hand
    // pointer is something to click, whatever its tag.
    return { mode: getComputedStyle(target).cursor === "pointer" ? "link" : "idle", label: "" };
  }

  // Icon-only: nothing visible to read, so say what it does.
  const aria = control.getAttribute("aria-label");
  if (aria && !control.textContent?.trim()) return { mode: "label", label: aria };

  return { mode: "link", label: "" };
}

export default function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false); /* true once a real mouse has moved */
  /* Which way the tag has flipped to stay on screen: "x" = left of the
     pointer (near the right edge), "y" = above it (near the bottom). */
  const [flip, setFlip] = useState("");
  /* Set by the effect below, which owns the pointer position; also called
     after a new word renders, since its width is only known then. */
  const placeTagRef = useRef<() => void>(undefined);

  useLayoutEffect(() => {
    placeTagRef.current?.();
  }, [label, mode]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const root = document.documentElement;
    let pointerX = -100;
    let pointerY = -100;
    let x = pointerX;
    let y = pointerY;
    let seen = false;
    let inside = false;
    let frame = 0;
    let recheck = 0;

    /* Keep the tag inside the window: flip it to the other side of the
       pointer when its measured width (or height) would run past the edge —
       e.g. "Remove from wishlist" on the trash icons by the right edge. */
    const placeTag = () => {
      const width = (textRef.current?.scrollWidth ?? 0) + TAG_PAD_X;
      let next = "";
      if (pointerX + 10 + width > window.innerWidth - TAG_GAP) next += "x";
      if (pointerY + 20 + TAG_H > window.innerHeight - TAG_GAP) next += "y";
      setFlip(next);
    };
    placeTagRef.current = placeTag;

    const apply = (target: Element | null) => {
      const next = resolve(target);
      setMode(next.mode);
      // Keep the last word while the tag shrinks away, so it doesn't blank
      // mid-transition.
      if (next.label) setLabel(next.label);
    };

    const tick = () => {
      x += (pointerX - x) * EASE;
      y += (pointerY - y) * EASE;
      node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      // Run only while catching up; the next mouse move restarts the loop.
      frame = Math.abs(pointerX - x) + Math.abs(pointerY - y) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      inside = true;
      if (!seen) {
        // First sighting: start at the pointer instead of flying in from the corner.
        seen = true;
        x = pointerX;
        y = pointerY;
        setActive(true);
      }
      apply(event.target instanceof Element ? event.target : null);
      placeTag();
      start();
    };

    /* The page can change under a still mouse — scrolling, or a click that
       opens a flyout or menu. Look again at whatever is now under the pointer,
       at most once a frame. */
    const lookAgain = () => {
      if (!seen || !inside || recheck) return;
      recheck = requestAnimationFrame(() => {
        recheck = 0;
        apply(document.elementFromPoint(pointerX, pointerY));
      });
    };
    const onClick = () => {
      lookAgain();
      // Flyouts and dropdowns animate in; check again once they've settled.
      window.setTimeout(lookAgain, 350);
    };

    /* Mouse left the page (off the window edge, or up to the browser's
       toolbar): wait at the spot on the edge where it went out. */
    const onLeave = (event: PointerEvent) => {
      if (!seen || event.pointerType !== "mouse") return;
      inside = false;
      pointerX = Math.min(Math.max(event.clientX, EDGE_INSET), window.innerWidth - EDGE_INSET);
      pointerY = Math.min(Math.max(event.clientY, EDGE_INSET), window.innerHeight - EDGE_INSET);
      setMode("idle");
      start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", lookAgain, { passive: true, capture: true });
    window.addEventListener("click", onClick, { passive: true, capture: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
      placeTagRef.current = undefined;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(recheck);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", lookAgain, { capture: true });
      window.removeEventListener("click", onClick, { capture: true });
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  /*
   * For each state: where the shape sits relative to the pointer's tip, its
   * look, height, widest it may get, and inner padding. Width comes from the
   * content (nothing, or the word), up to that limit.
   *   • square: solid crimson, centred on the tip;
   *   • link: a 48px see-through ring with a light crimson tint, centred a little
   *     below the tip so it surrounds the whole arrow or hand;
   *   • tag: solid crimson, dropped below and right of the tip so the pointer
   *     doesn't cover the word — or left of / above it when that side would
   *     run off the window (see placeTag).
   */
  const CENTRED = "-translate-x-1/2 -translate-y-1/2";
  const AROUND_POINTER = "translate-x-[calc(-50%+3px)] translate-y-[calc(-50%+8px)]";
  const BELOW = `${flip.includes("x") ? "-translate-x-[calc(100%+6px)]" : "translate-x-2.5"} ${
    flip.includes("y") ? "-translate-y-[calc(100%+6px)]" : "translate-y-5"
  }`;
  const SOLID = "rounded-[5px] border-transparent bg-(--brand-accent)";
  const TINTED =
    "rounded-[24px] border-[color-mix(in_srgb,var(--brand-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--brand-accent)_14%,transparent)]";
  const shape = {
    idle: `${CENTRED} ${SOLID} h-3.5 min-w-3.5 max-w-3.5 px-0 opacity-100`,
    link: `${AROUND_POINTER} ${TINTED} h-12 min-w-12 max-w-12 px-0 opacity-100`,
    label: `${BELOW} ${SOLID} h-5.5 min-w-3.5 max-w-48 px-2 opacity-100`,
    hidden: `${CENTRED} ${SOLID} h-3.5 min-w-3.5 max-w-3.5 px-0 opacity-0`,
  }[mode];

  return (
    /* Outer box: moved by the script so its top-left corner trails the
       pointer's tip. Inner shape: placed around that corner as above. Above
       flyouts (z-60) and toasts (z-100) so it never slips under them. */
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-110 transition-opacity duration-300 will-change-transform ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex items-center justify-center overflow-hidden border transition-[translate,height,min-width,max-width,padding,opacity,border-radius,background-color,border-color] duration-300 ease-out ${shape}`}
      >
        <span
          ref={textRef}
          className={`font-montserrat text-[10px] leading-none font-semibold tracking-[0.06em] whitespace-nowrap text-white uppercase transition-opacity duration-200 ${
            mode === "label" ? "opacity-100 delay-100" : "opacity-0"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
