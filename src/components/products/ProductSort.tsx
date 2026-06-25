"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sortBy") || "createdAt";
  const currentOrder = searchParams.get("sortOrder") || "desc";
  const sortValue = `${currentSort}-${currentOrder}`;

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-inter font-normal text-[14px] leading-none text-foreground whitespace-nowrap">
        Sort by:
      </span>
      <div className="relative">
        <select
          value={sortValue}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-35 pl-2.5 pr-7 py-2.5 border border-[#D4D4D4] rounded-[5px] bg-background font-inter font-normal text-[12px] text-foreground focus:outline-none cursor-pointer appearance-none"
        >
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
        <Icon
          icon="mdi:chevron-down"
          width={14}
          height={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground pointer-events-none"
        />
      </div>
    </div>
  );
}
