"use client";

import { useState, useEffect } from "react";
import PageLoader from "@/components/ui/PageLoader";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import { useGetFeaturedProductsQuery } from "@/lib/redux/features/products/productsApi";

/** How often the displayed value steps toward the real one. */
const TICK_MS = 40;
/** Fraction of the remaining distance covered each tick, plus a floor so the
 *  bar keeps creeping even when it is nearly there. */
const EASE = 0.12;
const MIN_STEP = 0.006;
/** How far ahead of real progress the bar may run, and its ceiling before the
 *  work is actually finished — it must never show 100 early. */
const LEAD = 0.1;
const CEILING = 0.9;
/** Beat at 100% so the completed bar is legible before the hand-off. */
const HOLD_MS = 260;

export default function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const [shown, setShown] = useState(0.06);

  // Preload critical data
  const { isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { isLoading: brandsLoading } = useGetBrandsQuery();
  const { isLoading: productsLoading } = useGetFeaturedProductsQuery();

  const pending = [categoriesLoading, brandsLoading, productsLoading];
  const target = pending.filter((loading) => !loading).length / pending.length;

  /*
   * The displayed value eases toward the real one rather than tracking it
   * directly. Two reasons: real progress arrives in thirds, and in practice all
   * three queries resolve within a few ms of each other — so a bar bound
   * straight to it would sit at 0 and then be dismissed before the jump to 100
   * ever rendered. Easing gives it something to animate, and the ceiling keeps
   * it honest: it cannot reach 100 until the work genuinely has.
   */
  useEffect(() => {
    const ceiling = target >= 1 ? 1 : Math.min(target + LEAD, CEILING);
    const id = setInterval(() => {
      setShown((prev) =>
        prev >= ceiling
          ? prev
          : Math.min(prev + Math.max((ceiling - prev) * EASE, MIN_STEP), ceiling),
      );
    }, TICK_MS);
    return () => clearInterval(id);
  }, [target]);

  useEffect(() => {
    if (target < 1 || shown < 0.995) return;
    const id = setTimeout(() => setIsReady(true), HOLD_MS);
    return () => clearTimeout(id);
  }, [target, shown]);

  if (!isReady) {
    return <PageLoader progress={shown} />;
  }

  return <>{children}</>;
}
