/*
 * Placeholder for ProductGridCard while a page of products loads. Mirrors the
 * card's box model (padding, square image, brand / name / price lines, button)
 * so swapping in the real cards doesn't shift the grid.
 */
export default function ProductCardSkeleton() {
  return (
    <div aria-hidden className="surface-card rounded-2xl p-3 lg:p-5 flex flex-col animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-gray-100" />
      <div className="mt-2.25 h-2.5 lg:h-3 w-1/4 rounded bg-gray-100" />
      <div className="mt-2 h-3.5 lg:h-4.5 w-11/12 rounded bg-gray-100" />
      <div className="mt-1.5 h-3.5 lg:h-4.5 w-2/3 rounded bg-gray-100" />
      <div className="mt-2.25 lg:mt-auto lg:pt-2.5 h-3.5 lg:h-5 w-1/3 rounded bg-gray-100" />
      <div className="mt-2.25 h-7 lg:h-10 w-full rounded-[8px] bg-gray-100" />
    </div>
  );
}
