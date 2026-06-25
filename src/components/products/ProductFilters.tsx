"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  brands: Brand[];
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
  variant?: "sidebar" | "sheet";
}

const SKIN_TYPES = ["Normal", "Dry", "Oily", "Combination", "Sensitive"];
const SKIN_CONCERNS = [
  "Acne & Breakouts", "Oil Control", "Large Pores", "Dryness",
  "Dehydration", "Sensitivity & Redness", "Dark Spots & Hyperpigmentation",
  "Uneven Skin Tone", "Dullness & Brightening", "Uneven Texture",
  "Fine Lines & Wrinkles", "Firmness & Elasticity", "Dark Circles",
  "Puffiness", "Sun Protection",
];

export default function ProductFilters({
  brands,
  minPrice,
  maxPrice,
  onPriceChange,
  variant = "sidebar",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceMin, setPriceMin] = useState(minPrice?.toString() || "");
  const [priceMax, setPriceMax] = useState(maxPrice?.toString() || "");
  const [openSections, setOpenSections] = useState({
    brand: true,
    skinType: true,
    skinConcern: true,
  });

  const selectedSkinTypes = (searchParams.get("skinType") || "")
    .split(",")
    .filter(Boolean);
  const selectedConcerns = (searchParams.get("skinConcern") || "")
    .split(",")
    .filter(Boolean);

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const handleBrandClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchParams.get("brand") === slug) {
      params.delete("brand");
    } else {
      params.set("brand", slug);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const toggleMultiParam = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceFilter = () => {
    const min = priceMin ? parseFloat(priceMin) : undefined;
    const max = priceMax ? parseFloat(priceMax) : undefined;
    onPriceChange(min, max);
  };

  const hasActiveFilters =
    searchParams.has("category") ||
    searchParams.has("brand") ||
    searchParams.has("skinType") ||
    searchParams.has("skinConcern") ||
    !!minPrice ||
    !!maxPrice;

  const clearFilters = () => {
    router.push("/products");
    onPriceChange(undefined, undefined);
    setPriceMin("");
    setPriceMax("");
  };

  // Collapsible section header + option list (used by Brand / Skin Type / Skin Concern).
  const section = (
    id: keyof typeof openSections,
    title: string,
    content: React.ReactNode
  ) => (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between"
      >
        <span className="font-inter font-medium text-[16px] leading-7 text-foreground">
          {title}
        </span>
        <Icon
          icon="mdi:chevron-down"
          width={20}
          height={20}
          className={`text-foreground transition-transform duration-200 ${
            openSections[id] ? "rotate-180" : ""
          }`}
        />
      </button>
      {openSections[id] && content}
    </div>
  );

  const optionClass = (active: boolean) =>
    `w-full text-left font-inter font-normal text-[14px] leading-7 transition-colors ${
      active ? "text-primary" : "text-[#4B4B4B] hover:text-primary"
    }`;

  return (
    <div className="flex flex-col gap-5">
      {/* Filters heading */}
      <div
        className={`relative flex items-center ${
          variant === "sheet" ? "justify-center" : "justify-between"
        }`}
      >
        <div className="w-fit">
          <h2 className="font-montserrat font-medium text-[18px] leading-7 text-black text-center">
            Filters
          </h2>
          <div className="h-0.5 bg-primary mt-1" />
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`font-inter font-normal text-[12px] leading-none text-primary hover:underline ${
              variant === "sheet" ? "absolute right-0" : ""
            }`}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-3">
        <p className="font-inter font-medium text-[16px] leading-7 text-foreground">
          Price Range
        </p>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-inter font-normal text-[14px] leading-none text-foreground">
              From
            </label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={handlePriceFilter}
              onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
              placeholder="0"
              className="w-full h-9 px-2.5 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <span className="pb-2 font-inter text-sm text-foreground">-</span>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-inter font-normal text-[14px] leading-none text-foreground">
              To
            </label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={handlePriceFilter}
              onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
              placeholder="0"
              className="w-full h-9 px-2.5 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="border-t-[0.5px] border-t-[#B1A6A6]" />
      {section(
        "brand",
        "Brand",
        <ul className="flex flex-col">
          {brands.map((brand) => {
            const isActive = searchParams.get("brand") === brand.slug;
            return (
              <li key={brand.id}>
                <button
                  onClick={() => handleBrandClick(brand.slug)}
                  className={optionClass(isActive)}
                >
                  {brand.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Skin Type */}
      <div className="border-t-[0.5px] border-t-[#B1A6A6]" />
      {section(
        "skinType",
        "Skin Type",
        <ul className="flex flex-col">
          {SKIN_TYPES.map((type) => (
            <li key={type}>
              <button
                onClick={() => toggleMultiParam("skinType", type, selectedSkinTypes)}
                className={optionClass(selectedSkinTypes.includes(type))}
              >
                {type}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Skin Concern */}
      <div className="border-t-[0.5px] border-t-[#B1A6A6]" />
      {section(
        "skinConcern",
        "Skin Concern",
        <ul className="flex flex-col">
          {SKIN_CONCERNS.map((concern) => (
            <li key={concern}>
              <button
                onClick={() =>
                  toggleMultiParam("skinConcern", concern, selectedConcerns)
                }
                className={optionClass(selectedConcerns.includes(concern))}
              >
                {concern}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
