"use client";

import { Product } from "@/types/product.types";
import { PdpHeading } from "./shared";

interface Props {
  product: Product;
}

/**
 * Specifications table for the product detail page.
 *
 * Vendor-entered key/value specifications only. Brand, category and SKU used to
 * be prepended here as derived rows, but they are already shown elsewhere on the
 * page — repeating them padded the table with things the customer had just read.
 * Country of origin and colour variants went with them for the same reason:
 * everything here now comes from one source, the specifications array.
 */
export default function ProductSpecifications({ product }: Props) {
  const rows = product.specifications ?? [];

  if (rows.length === 0) return null;

  return (
    <div>
      <PdpHeading>Specifications</PdpHeading>

      {/* A plain two-column table: the name in a shaded column, the value right
          beside it (left-aligned), one row per spec. Capped in width so a value
          never ends up far from its name on wide screens. */}
      <div className="max-w-4xl overflow-hidden rounded-xl border border-[#E5E5E5]">
        <dl className="divide-y divide-[#EBEBEB]">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:grid-cols-[14rem_minmax(0,1fr)]"
            >
              <dt className="bg-[#F6F6F6] px-3.5 py-3 font-inter text-[13px] font-medium leading-5 text-[#111111] sm:px-5 lg:text-[14px]">
                {row.key}
              </dt>
              <dd className="px-3.5 py-3 font-inter text-[13px] leading-5 text-[#3A3A3A] break-words sm:px-5 lg:text-[14px]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
