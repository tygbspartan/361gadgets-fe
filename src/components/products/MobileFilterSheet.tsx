"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Bottom sheet that slides up from the Filter button area and can be
// dismissed by dragging it down. Stays mounted so open/close animates.
export default function MobileFilterSheet({ open, onClose, children }: Props) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  // Reset any drag offset whenever it (re)opens.
  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  // Lock background scroll while open.
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
    <div
      className={`lg:hidden fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet */}
      <div
        style={{ transform: open ? `translateY(${dragY}px)` : "translateY(100%)" }}
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-background rounded-t-[20px] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] ${
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

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
