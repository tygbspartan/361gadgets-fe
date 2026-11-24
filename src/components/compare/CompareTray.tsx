"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useCompare } from "@/lib/redux/features/compare/useCompare";
import { COMPARE_MAX } from "@/lib/redux/features/compare/compareSlice";
import { ROUTES } from "@/constants/routes";

/*
 * Slim bar along the bottom of the screen while products are picked for
 * comparison: their thumbnails (each removable), empty slots up to 3, and the
 * button to the side-by-side page. Hidden on the compare page itself.
 */
export default function CompareTray() {
  const pathname = usePathname();
  const { items, remove, clear } = useCompare();

  if (items.length === 0 || pathname?.startsWith(ROUTES.COMPARE)) return null;

  const ready = items.length >= 2;
  const href = `${ROUTES.COMPARE}?ids=${items.map((i) => i.id).join(",")}`;

  return (
    <div
      role="region"
      aria-label="Products to compare"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-black/10 bg-white/95 p-2.5 shadow-[0_10px_40px_-10px_rgb(0_0_0/0.35)] backdrop-blur sm:gap-4 sm:p-3">
        <div className="hidden shrink-0 sm:block">
          <p className="font-montserrat text-[13px] font-semibold text-[#111111]">
            Compare ({items.length}/{COMPARE_MAX})
          </p>
          {items[0]?.categoryName && (
            <p className="max-w-36 truncate font-inter text-[11px] text-[#666666]">{items[0].categoryName}</p>
          )}
        </div>

        <ul className="flex flex-1 gap-2">
          {Array.from({ length: COMPARE_MAX }).map((_, i) => {
            const item = items[i];
            return (
              <li key={item?.id ?? `empty-${i}`} className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
                {item ? (
                  <>
                    <Link
                      href={`${ROUTES.PRODUCT}/${item.slug}`}
                      title={item.name}
                      className="block h-full w-full overflow-hidden rounded-lg border border-black/10 bg-gray-50"
                    >
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="h-full w-full object-cover" />
                      ) : null}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name} from comparison`}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] text-white shadow"
                    >
                      <Icon icon="mdi:close" width={12} height={12} />
                    </button>
                  </>
                ) : (
                  <div aria-hidden className="h-full w-full rounded-lg border border-dashed border-black/20" />
                )}
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={clear}
          className="hidden shrink-0 font-inter text-[12px] font-medium text-[#666666] underline-offset-4 hover:text-[#111111] hover:underline sm:block"
        >
          Clear
        </button>
        {ready ? (
          <Link
            href={href}
            className="btn-accent shrink-0 rounded-[8px] px-4 py-2.5 font-inter text-[12px] font-semibold uppercase tracking-wide sm:px-5 sm:text-[13px]"
          >
            Compare {items.length}
          </Link>
        ) : (
          <span className="shrink-0 rounded-[8px] bg-gray-100 px-3 py-2.5 font-inter text-[11px] font-medium text-[#666666] sm:text-[12px]">
            Add 1 more
          </span>
        )}
        <button
          type="button"
          onClick={clear}
          aria-label="Clear comparison"
          className="shrink-0 text-[#666666] sm:hidden"
        >
          <Icon icon="mdi:close" width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
