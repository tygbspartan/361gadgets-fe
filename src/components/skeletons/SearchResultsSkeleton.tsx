import Skeleton from "./Skeleton";

/* Placeholder rows for the search dropdown while results load. */
export default function SearchResultsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Searching" className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
