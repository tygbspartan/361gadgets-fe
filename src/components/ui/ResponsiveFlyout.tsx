"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Height (px) of the navbar gap left above the sheet on mobile.
const NAVBAR_GAP = 56;

/**
 * Flyout chrome that adapts to screen size:
 *  - Desktop (lg+): slides in from the right as a side panel.
 *  - Mobile: slides up from the bottom as a sheet that can be dragged down.
 *
 * The mobile sheet is sized from the *measured* visible viewport
 * (`window.visualViewport`) rather than any CSS viewport unit. CSS units
 * (vh/dvh) disagree with the actual visible area on many mobile browsers, so
 * the footer/button could fall behind the browser chrome. Measuring in JS is
 * immune to that and works consistently across devices.
 */
export default function ResponsiveFlyout({ open, onClose, children }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  // Desktop panel is 40% + 250px between 1024–1350px, then plain 40%.
  const [extraWide, setExtraWide] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  // Measured visible viewport (null until measured / on unsupported browsers).
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(
    null
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (max-width: 1349px)");
    const update = () => setExtraWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Track the real visible viewport.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () =>
      setViewport({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    startYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - startYRef.current));
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragY > 120) onClose();
    setDragY(0);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-59 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {isMobile ? (
        /* Mobile overlay sized to the measured visible viewport. The navbar gap
           pushes the sheet down; the sheet takes the remaining height (flex-1)
           so its footer always lands on the real visible bottom. */
        <div
          className="fixed inset-x-0 top-0 z-60 flex flex-col h-dvh pointer-events-none"
          style={
            viewport
              ? { top: viewport.top, height: viewport.height }
              : undefined
          }
        >
          {/* Navbar gap (clicks fall through to the backdrop) */}
          <div style={{ height: NAVBAR_GAP }} className="shrink-0" />
          {/* Sheet */}
          <div
            style={{
              transform: open ? `translateY(${dragY}px)` : "translateY(101%)",
            }}
            className={`pointer-events-auto flex-1 min-h-0 flex flex-col bg-white rounded-t-[20px] overflow-hidden ${
              dragging ? "" : "transition-transform duration-300 ease-out"
            }`}
          >
            {/* Drag handle */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="w-10 h-1 rounded-full bg-[#D4D4D4]" />
            </div>
            {children}
          </div>
        </div>
      ) : (
        /* Desktop: right-side panel */
        <div
          style={{ width: extraWide ? "calc(40% + 250px)" : "40%" }}
          className={`fixed top-0 right-0 h-full max-w-[90%] bg-white z-60 flex flex-col transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {children}
        </div>
      )}
    </>
  );
}
