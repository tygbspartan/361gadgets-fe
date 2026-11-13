import { useSyncExternalStore } from "react";

/*
 * Products per page for the `.products-grid` listing, chosen so the last row
 * is always full. The breakpoints mirror `.products-grid` in globals.css —
 * change both together.
 *
 *   phone   <768     2 columns  -> 20 (10 rows)
 *   tablet  768+     3 columns  -> 21 (7 rows)
 *   laptop  1024+    4 columns  -> 20 (5 rows)
 *   desktop 1350+    5 columns  -> 25 (5 rows)
 */
const TIERS = [
  { query: "(min-width: 1350px)", size: 25 },
  { query: "(min-width: 1024px)", size: 20 },
  { query: "(min-width: 768px)", size: 21 },
] as const;
const PHONE_SIZE = 20;

function getSnapshot(): number {
  return TIERS.find((t) => window.matchMedia(t.query).matches)?.size ?? PHONE_SIZE;
}

function subscribe(onChange: () => void): () => void {
  const lists = TIERS.map((t) => window.matchMedia(t.query));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

/**
 * The page size for the current viewport, or null during server rendering
 * (the viewport isn't known yet; callers should hold their request until it is).
 */
export function useGridPageSize(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
