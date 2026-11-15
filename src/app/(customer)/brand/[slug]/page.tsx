import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, toPlainText, truncate } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import { getBrandBySlug, getProductsPage } from "@/lib/server/catalog";
import CollectionView from "@/components/catalog/CollectionView";
import SeoContent from "@/components/seo/SeoContent";
import FaqSection from "@/components/seo/FaqSection";

const LIMIT = 12;

// Dynamically rendered (ƒ) — reads searchParams for pagination/sort/filters with
// per-URL canonical/robots. 1h ISR fetch cache keeps it fast.
type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const brand = await getBrandBySlug(slug);
  // Missing: the page calls notFound(); title the 404 to match.
  if (!brand) return { title: "Page not found", robots: { index: false } };

  const cleanPath = `/brand/${slug}`;
  const pageNum = Math.max(1, Number(str(sp.page)) || 1);
  const hasFilterOrSort = Object.keys(sp).some(
    (k) => k !== "page" && sp[k] !== undefined && sp[k] !== ""
  );

  const description =
    truncate(toPlainText(brand.metaDescription)) ||
    truncate(toPlainText(brand.seoDescription)) ||
    `Shop genuine ${brand.name} products online in Nepal at 361 Gadgets — authentic, best prices, fast delivery.`;
  // The admin's Meta Title wins; otherwise a standard "<Brand> … in Nepal" title.
  const title =
    brand.metaTitle?.trim() || `${brand.name} Products in Nepal — Genuine | 361 Gadgets`;

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, url: cleanPath, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: hasFilterOrSort ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: hasFilterOrSort
        ? cleanPath
        : pageNum > 1
        ? `${cleanPath}?page=${pageNum}`
        : cleanPath,
    },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const page = Math.max(1, Number(str(sp.page)) || 1);
  const sortBy = str(sp.sortBy);
  const sortOrder = str(sp.sortOrder);

  const { data: products, pagination } = await getProductsPage({
    brandSlug: slug,
    page,
    limit: LIMIT,
    sortBy,
    sortOrder,
    minPrice: str(sp.minPrice),
    maxPrice: str(sp.maxPrice),
    inStock: str(sp.inStock),
  });

  const cleanPath = `/brand/${slug}`;
  // The buying guide and FAQ go on the canonical first page only, so paginated
  // and filtered variants don't repeat them.
  const showSeoContent =
    page === 1 &&
    !Object.keys(sp).some((k) => k !== "page" && sp[k] !== undefined && sp[k] !== "");
  // Shown above the products: the short description (a lead line under the
  // brand name), then the longer brand page copy.
  const intro = [brand.description, brand.seoDescription]
    .map((t) => t?.trim())
    .filter((t, i, all) => t && all.indexOf(t) === i)
    .join("\n\n");
  // Pagination hrefs preserve every active filter/sort, swapping only the page.
  const hrefForPage = (n: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "page") continue;
      if (typeof v === "string" && v) qs.set(k, v);
    }
    if (n > 1) qs.set("page", String(n));
    const s = qs.toString();
    return s ? `${cleanPath}?${s}` : cleanPath;
  };

  const collectionJsonLd = buildCollectionPageJsonLd({
    name: `${brand.name} — 361 Gadgets`,
    description:
      brand.seoDescription?.trim() ||
      brand.metaDescription?.trim() ||
      `Shop genuine ${brand.name} products online in Nepal at 361 Gadgets.`,
    url: `${SITE_URL}${cleanPath}`,
    total: pagination.total,
    items: products.map((p) => ({ name: p.name, slug: p.slug })),
    // The brand itself, so search engines tie this page to it.
    about: {
      "@type": "Brand",
      name: brand.name,
      url: `${SITE_URL}${cleanPath}`,
      ...(brand.logoUrl ? { logo: brand.logoUrl } : {}),
      ...(brand.description?.trim() ? { description: brand.description.trim() } : {}),
    },
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: brand.name, url: `${SITE_URL}${cleanPath}` },
  ]);

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <CollectionView
        title={brand.name}
        intro={intro || null}
        products={products}
        page={page}
        totalPages={pagination.totalPages}
        hrefForPage={hrefForPage}
        brands={[]}
        showBrandFilter={false}
        footer={
          showSeoContent && (brand.seoContent?.trim() || brand.faqs?.length) ? (
            <>
              <SeoContent content={brand.seoContent} />
              <FaqSection faqs={brand.faqs} title={`${brand.name}: frequently asked questions`} />
            </>
          ) : null
        }
      />
    </>
  );
}
