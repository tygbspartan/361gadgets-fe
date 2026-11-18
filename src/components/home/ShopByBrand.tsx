import Image from "next/image";
import Link from "next/link";
import type { HomeBrand } from "@/lib/server/catalog";
import SectionTitle from "@/components/home/SectionTitle";
import { ROUTES } from "@/constants/routes";

/** Columns 2 → 3 → 4 → 6, so 6 or 12 brands fill whole rows. */
export const BRAND_GRID = "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-6";

/* One brand as a logo tile linking to its page (/brand/<slug>). Logo in grey
   at rest, full colour on hover; the name stays in the link for screen
   readers (and shows as text when there's no logo). */
export function BrandTile({ brand }: { brand: HomeBrand }) {
  return (
    <Link
      href={`${ROUTES.BRAND}/${brand.slug}`}
      data-cursor={`Shop ${brand.name}`}
      className="surface-card hover-lift group flex aspect-3/2 w-full flex-col items-center justify-center gap-3 rounded-2xl p-4 lg:p-5"
    >
      {brand.logoUrl ? (
        <span className="relative block h-3/5 w-4/5">
          <Image
            src={brand.logoUrl}
            alt={`${brand.name} logo`}
            fill
            sizes="(min-width: 1280px) 12vw, (min-width: 768px) 20vw, 40vw"
            className="object-contain grayscale opacity-80 transition-[filter,opacity] duration-300 group-hover:grayscale-0 group-hover:opacity-100"
          />
        </span>
      ) : null}
      <span
        className={`font-montserrat text-[12px] font-semibold uppercase tracking-[0.08em] text-[#111111] lg:text-[13px] ${
          brand.logoUrl ? "sr-only" : ""
        }`}
      >
        {brand.name}
      </span>
    </Link>
  );
}

/*
 * "Shop by Brand" on the homepage: the brands marked Featured in the admin.
 * Hidden when none are featured; links on to the full list at /brands.
 */
export default function ShopByBrand({ brands: all }: { brands: HomeBrand[] }) {
  const brands = all.filter((b) => b.isActive);

  if (brands.length === 0) return null;

  return (
    <div>
      <SectionTitle>Shop by Brand</SectionTitle>
      <ul className={`mt-5 lg:mt-8.75 ${BRAND_GRID}`}>
        {brands.map((brand) => (
          <li key={brand.id}>
            <BrandTile brand={brand} />
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <Link
          href={ROUTES.BRANDS}
          className="font-montserrat text-[12px] font-semibold uppercase tracking-[0.12em] text-[#111111] underline-offset-4 hover:underline lg:text-[13px]"
        >
          View all brands
        </Link>
      </div>
    </div>
  );
}
