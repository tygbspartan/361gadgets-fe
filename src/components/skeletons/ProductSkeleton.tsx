import Skeleton from "./Skeleton";

/*
 * Placeholder for a product page while it loads: gallery on the left (main
 * image + thumbnails), details on the right (brand, name, rating, price,
 * quantity, buttons, overview), then the specifications table.
 */
export default function ProductSkeleton() {
  return (
    <div className="page-wrapper" role="status" aria-label="Loading product">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Gallery */}
        <div>
          <Skeleton className="w-full aspect-square rounded-xl" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-7 w-11/12" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40 mt-2" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 flex-1" />
          </div>
          <Skeleton className="h-11 w-full" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-12 max-w-4xl space-y-3">
        <Skeleton className="h-7 w-44" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
