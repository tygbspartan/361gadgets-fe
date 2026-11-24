import Skeleton from "@/components/skeletons/Skeleton";

/* Placeholder for the comparison table: a column of row labels and three
   product columns (image, name, then rows). */
export default function CompareSkeleton() {
  return (
    <div className="page-wrapper" role="status" aria-label="Loading comparison">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-0.5 w-64" />
      </div>
      <div className="mt-8 grid grid-cols-[8rem_repeat(3,minmax(10rem,1fr))] gap-4 overflow-hidden lg:grid-cols-[12rem_repeat(3,minmax(0,1fr))]">
        <div />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r} className="contents">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 3 }).map((_, c) => (
              <Skeleton key={c} className="h-4 w-3/4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
