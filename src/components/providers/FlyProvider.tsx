"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface FlyItem {
  id: number;
  imageUrl: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  target: "cart" | "wishlist";
}

interface FlyContextValue {
  flyToCart: (sourceRect: DOMRect, imageUrl: string) => void;
  flyToWishlist: (sourceRect: DOMRect, imageUrl: string) => void;
}

const FlyContext = createContext<FlyContextValue>({
  flyToCart: () => {},
  flyToWishlist: () => {},
});

export function useFly() {
  return useContext(FlyContext);
}

const S = 56; // bubble size in px

const BOUNCE_CSS = `
  @keyframes fly-target-bounce {
    0%   { transform: scale(1); }
    25%  { transform: scale(1.5); }
    55%  { transform: scale(0.85); }
    75%  { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  .fly-target-bounce { animation: fly-target-bounce 0.5s ease !important; }
`;

function FlyBubble({ item, onDone }: { item: FlyItem; onDone: () => void }) {
  const name = `fly_${item.id}`;

  return (
    <>
      <style>{`
        @keyframes ${name} {
          0%   { transform: translate(${item.startX - S / 2}px, ${item.startY - S / 2}px) scale(1);    opacity: 1; }
          60%  { opacity: 0.75; }
          100% { transform: translate(${item.endX - S / 2}px,   ${item.endY - S / 2}px)   scale(0.15); opacity: 0; }
        }
      `}</style>
      <div
        onAnimationEnd={onDone}
        style={{
          position: "fixed",
          inset: "0 auto auto 0",
          width: S,
          height: S,
          borderRadius: "50%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 9999,
          border: "2px solid white",
          boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
          animation: `${name} 550ms cubic-bezier(0.4, 0, 0.6, 1) forwards`,
          willChange: "transform, opacity",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </>
  );
}

export function FlyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<FlyItem[]>([]);
  const nextId = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  const trigger = useCallback((sourceRect: DOMRect, imageUrl: string, target: "cart" | "wishlist") => {
    const targetEl = document.querySelector<HTMLElement>(`[data-fly-target="${target}"]`);
    if (!targetEl || !imageUrl) return;
    const tRect = targetEl.getBoundingClientRect();
    const id = nextId.current++;
    setItems((prev) => [
      ...prev,
      {
        id,
        imageUrl,
        startX: sourceRect.left + sourceRect.width / 2,
        startY: sourceRect.top + sourceRect.height / 2,
        endX: tRect.left + tRect.width / 2,
        endY: tRect.top + tRect.height / 2,
        target,
      },
    ]);
  }, []);

  const flyToCart = useCallback(
    (r: DOMRect, url: string) => trigger(r, url, "cart"),
    [trigger]
  );
  const flyToWishlist = useCallback(
    (r: DOMRect, url: string) => trigger(r, url, "wishlist"),
    [trigger]
  );

  const onDone = useCallback((item: FlyItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    const el = document.querySelector<HTMLElement>(`[data-fly-target="${item.target}"]`);
    if (el) {
      el.classList.add("fly-target-bounce");
      setTimeout(() => el.classList.remove("fly-target-bounce"), 550);
    }
  }, []);

  return (
    <FlyContext.Provider value={{ flyToCart, flyToWishlist }}>
      {children}
      {mounted &&
        createPortal(
          <>
            <style>{BOUNCE_CSS}</style>
            {items.map((item) => (
              <FlyBubble key={item.id} item={item} onDone={() => onDone(item)} />
            ))}
          </>,
          document.body
        )}
    </FlyContext.Provider>
  );
}
