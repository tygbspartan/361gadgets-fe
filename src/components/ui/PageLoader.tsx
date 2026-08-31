import Image from "next/image";
import { BRAND } from "@/config/brand";

/** Never start at a literally empty bar — it reads as broken rather than early. */
const MIN_SHOWN = 0.08;

/*
 * Full-screen gate shown by LoadingProvider before first paint. Plain white to
 * match the canvas, so the hand-off to the real page is seamless.
 *
 * `progress` is real: LoadingProvider derives it from how many of its preload
 * queries have resolved. Because that arrives in coarse steps, the fill is
 * transitioned rather than snapped, so the bar sweeps between them instead of
 * jumping.
 */
export default function PageLoader({ progress = 0 }: { progress?: number }) {
  const clamped = Math.min(Math.max(progress, MIN_SHOWN), 1);
  const pct = Math.round(clamped * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex w-[min(72vw,300px)] flex-col items-center">
        <Image
          src={BRAND.logo.primary}
          alt={BRAND.name}
          width={200}
          height={65}
          priority
          className="h-auto w-40 lg:w-48"
        />

        <div
          role="progressbar"
          aria-label="Loading"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-8 h-0.5 w-full overflow-hidden rounded-full bg-(--hairline)"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-3 font-inter text-[11px] uppercase tracking-[0.08em] text-gray-500 tabular-nums">
          {pct}%
        </p>
      </div>
    </div>
  );
}
