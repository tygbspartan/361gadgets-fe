import Skeleton from "./Skeleton";

/*
 * Rows of "thumbnail + a few lines", for lists that load in place: cart and
 * wishlist flyouts, My Orders, My Reviews.
 */
export default function ListSkeleton({ rows = 3, thumb = true }: { rows?: number; thumb?: boolean }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          {thumb && <Skeleton className="shrink-0 w-19 h-19 lg:w-30 lg:h-30 rounded-none" />}
          <div className="flex-1 space-y-2.5 pt-1">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
