import type { Metadata } from "next";
import { publicPage } from "@/lib/seo/metadata";
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import { getAllBrands } from "@/lib/server/catalog";
import { BRAND_GRID, BrandTile } from "@/components/home/ShopByBrand";

// Built on the server; refreshed hourly or when the catalog changes.
export const revalidate = 3600;

export const metadata: Metadata = publicPage({
  title: "Shop by Brand: Apple, Samsung, JBL & More | 361 Gadgets",
  absoluteTitle: true,
  description:
    "Shop genuine gadgets by brand at 361 Gadgets Nepal: Apple, Samsung, Xiaomi, JBL, Anker, boAt, Sony, Logitech and more. Cash on delivery across Nepal.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await getAllBrands();
  const url = `${SITE_URL}/brands`;

  return (
    <div className="page-wrapper">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Brands at 361 Gadgets",
          url,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: brands.length,
            itemListElement: brands.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/brand/${b.slug}`,
              name: b.name,
            })),
          },
        }}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Brands", url },
        ])}
      />

      <div className="flex justify-center">
        <div className="w-fit">
          <h1 className="text-center font-montserrat text-[22px] font-semibold leading-tight text-black lg:text-[28px]">
            Shop by Brand
          </h1>
          <div className="heading-rule -mx-5 mt-2" />
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-2xl text-center font-inter text-[14px] leading-6 text-[#555555] lg:text-[15px]">
        Every brand we carry, all genuine. Pick a brand to see its products available in Nepal, with
        cash on delivery and delivery to every district.
      </p>

      {brands.length === 0 ? (
        <p className="mt-10 text-center font-inter text-gray-500">Brands will appear here soon.</p>
      ) : (
        <ul className={`mt-8 lg:mt-10 ${BRAND_GRID}`}>
          {brands.map((brand) => (
            <li key={brand.id}>
              <BrandTile brand={brand} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
