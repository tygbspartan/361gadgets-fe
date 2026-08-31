"use client";

import { Product } from "@/types/product.types";

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
      <h2 className="font-montserrat font-medium text-[18px] lg:text-2xl leading-none text-black w-fit mx-auto lg:mx-0 text-center border-b-2 border-primary pb-1 mb-5">
        Specifications
      </h2>

      <div className="border border-[#E5E5E5] rounded-[6px] overflow-hidden">
        <dl className="grid grid-cols-1 lg:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-start justify-between gap-4 px-4 py-3 border-b border-[#EFEFEF] hover:bg-[#FAFAFA] transition-colors last:border-b-0"
            >
              <dt className="font-inter font-medium text-[13px] lg:text-sm leading-5 text-black w-2/5 shrink-0">
                {row.key}
              </dt>
              <dd className="font-inter font-normal text-[13px] lg:text-sm leading-5 tracking-[0.01em] text-[#4B4B4B] text-right">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
