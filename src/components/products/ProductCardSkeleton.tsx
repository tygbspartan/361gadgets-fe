/*
 * Placeholder for ProductGridCard while a page of products loads. Mirrors the
 * card's box model (padding, square image, brand / name / price lines, button)
 * so swapping in the real cards doesn't shift the grid.
 */
export default function ProductCardSkeleton() {
  return (
    <div aria-hidden className="product-card surface-card rounded-2xl p-3 @[13.5rem]:p-5 flex flex-col animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-gray-100" />
      <div className="mt-2.25 h-2.5 @[13.5rem]:h-3 w-1/4 rounded bg-gray-100" />
      <div className="mt-2 h-3.5 @[13.5rem]:h-4.5 w-11/12 rounded bg-gray-100" />
      <div className="mt-1.5 h-3.5 @[13.5rem]:h-4.5 w-2/3 rounded bg-gray-100" />
      <div className="mt-2.25 @[13.5rem]:mt-auto @[13.5rem]:pt-2.5 h-3.5 @[13.5rem]:h-5 w-1/3 rounded bg-gray-100" />
      <div className="mt-2.25 h-7 @[13.5rem]:h-10 w-full rounded-[8px] bg-gray-100" />
    </div>
  );
}
