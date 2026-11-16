import Skeleton from "./Skeleton";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

/*
 * Placeholder for a category or brand page while its data loads. Mirrors
 * CollectionFilterLayout + CollectionView (filter sidebar on desktop, title,
 * intro, product grid) so the real page lands without shifting.
 */
export default function CollectionSkeleton() {
  return (
    <div className="page-wrapper" role="status" aria-label="Loading products">
      {/* Mobile: centered title + filter/sort row */}
      <div className="lg:hidden flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-0.5 w-48" />
      </div>
      <div className="lg:hidden mt-5 mb-5 flex items-center justify-between">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="flex gap-9">
        {/* Desktop: filter sidebar */}
        <aside className="hidden lg:block w-1/5 shrink-0 space-y-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24 mt-6" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
          <Skeleton className="h-4 w-16 mt-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-3/4" />
          ))}
        </aside>

        <div className="flex-1 min-w-0">
          {/* Desktop: title + sort */}
          <div className="hidden lg:flex items-center justify-between mb-5">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-10 w-44" />
          </div>
          {/* Intro text */}
          <div className="mb-6 max-w-4xl space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="products-grid products-grid-listing">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
