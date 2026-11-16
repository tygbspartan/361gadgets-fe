import Skeleton from "./Skeleton";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

/*
 * Placeholder for the homepage while it loads: the hero area, the brand strip,
 * then a titled product row. Same backgrounds and heights as the real
 * sections, so the switch is seamless.
 */
export default function HomeSkeleton() {
  return (
    <div className="-mt-12.5" role="status" aria-label="Loading">
      <div className="flex min-h-[calc(100svh-var(--nav-h))] flex-col items-center justify-center gap-5 bg-(--hero-bg) px-6">
        <Skeleton className="h-12 w-4/5 max-w-2xl bg-black/5 lg:h-20" />
        <Skeleton className="h-12 w-3/5 max-w-xl bg-black/5 lg:h-20" />
        <Skeleton className="mt-4 h-4 w-72 max-w-full bg-black/5" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-12 w-40 rounded-full bg-black/5" />
          <Skeleton className="h-12 w-36 rounded-full bg-black/5" />
        </div>
      </div>
      <BrandStripSkeleton />
      <div className="page-wrapper mt-17.5">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-0.5 w-64" />
        </div>
        <div className="mt-5 lg:mt-8.75 home-product-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** The brand logo strip under the hero, as grey logo-sized boxes. */
export function BrandStripSkeleton({ overlap = false }: { overlap?: boolean }) {
  return (
    <div
      aria-hidden
      className={`relative z-10 w-full overflow-hidden rounded-t-[28px] border-t border-(--hairline) bg-background pt-9 pb-5 lg:pt-11 lg:pb-7 ${
        overlap ? "-mt-(--hero-overlap) shadow-[0_-10px_30px_-14px_rgb(0_0_0/0.18)]" : ""
      }`}
    >
      <div className="flex justify-center gap-10 lg:gap-20 px-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="shrink-0 w-21.75 h-12.5 md:w-27.5 md:h-17.5 lg:w-38.75 lg:h-22.5" />
        ))}
      </div>
    </div>
  );
}
