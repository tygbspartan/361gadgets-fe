import Skeleton from "./Skeleton";

/* Placeholder for the checkout while the cart loads: delivery form on the
   left, order summary on the right (stacked on mobile). */
export default function CheckoutSkeleton() {
  return (
    <div className="page-wrapper pb-16" role="status" aria-label="Loading checkout">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-5">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-6 w-40 mt-4" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4 rounded-xl border border-[#E5E5E5] p-5">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-16 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-12 w-full mt-2" />
        </div>
      </div>
    </div>
  );
}
