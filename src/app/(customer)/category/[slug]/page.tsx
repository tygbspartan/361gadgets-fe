import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  toPlainText,
  truncate,
} from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import SeoContent from "@/components/seo/SeoContent";
import FaqSection from "@/components/seo/FaqSection";
import {
  getCategoryBySlug,
  getProductsPage,
  getBrandsList,
  type CategoryDetail,
} from "@/lib/server/catalog";
import CollectionView from "@/components/catalog/CollectionView";

const LIMIT = 12;

// Dynamically rendered (ƒ): the page reads searchParams for pagination, sort and
// filters (with per-URL canonical/robots), which is incompatible with static
// prerendering. Freshness comes from the 1h ISR fetch cache in lib/server/catalog.
type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

// Ancestor chain (top → self) from the category's parent links.
function chainOf(cat: CategoryDetail): { name: string; slug: string }[] {
  const chain: { name: string; slug: string }[] = [{ name: cat.name, slug: cat.slug }];
  let p = cat.parent;
  while (p) {
    chain.unshift({ name: p.name, slug: p.slug });
    p = p.parent ?? null;
  }
  return chain;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  // Missing: the page calls notFound(); title the 404 to match.
  if (!category) return { title: "Page not found", robots: { index: false } };

  const cleanPath = `/category/${slug}`;
  const pageNum = Math.max(1, Number(str(sp.page)) || 1);
  const hasFilterOrSort = Object.keys(sp).some(
    (k) => k !== "page" && sp[k] !== undefined && sp[k] !== ""
  );

  const description =
    truncate(toPlainText(category.seoDescription)) ||
    `Shop ${category.name} online in Nepal at 361 Gadgets — genuine tech, best prices, fast delivery across the country.`;
  const title = `${category.name} — Price in Nepal | 361 Gadgets`;

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, url: cleanPath, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    // Filter/sort variants are noindex,follow and canonical to the clean URL;
    // clean pagination is indexable with a self-referencing canonical.
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(str(sp.page)) || 1);
  const sortBy = str(sp.sortBy);
  const sortOrder = str(sp.sortOrder);

  const [{ data: products, pagination }, brands] = await Promise.all([
    getProductsPage({
      categorySlug: slug,
      brandSlug: str(sp.brand),
      page,
      limit: LIMIT,
      sortBy,
      sortOrder,
      minPrice: str(sp.minPrice),
      maxPrice: str(sp.maxPrice),
      inStock: str(sp.inStock),
    }),
    getBrandsList(),
  ]);

  const chain = chainOf(category);
  const cleanPath = `/category/${slug}`;
  // The long copy and FAQ go on the canonical first page only, so paginated and
  // filtered variants don't repeat them.
  const showSeoContent =
    page === 1 &&
    !Object.keys(sp).some((k) => k !== "page" && sp[k] !== undefined && sp[k] !== "");

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
    name: `${category.name} — 361 Gadgets`,
    description:
      category.seoDescription?.trim() ||
      `Shop ${category.name} online in Nepal at 361 Gadgets.`,
    url: `${SITE_URL}${cleanPath}`,
    total: pagination.total,
    items: products.map((p) => ({ name: p.name, slug: p.slug })),
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    ...chain.map((c) => ({ name: c.name, url: `${SITE_URL}/category/${c.slug}` })),
  ]);

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <CollectionView
        title={category.name}
        intro={category.seoDescription}
        products={products}
        page={page}
        totalPages={pagination.totalPages}
        hrefForPage={hrefForPage}
        brands={brands}
        footer={
          showSeoContent && (category.seoContent?.trim() || category.faqs?.length) ? (
            <>
              <SeoContent content={category.seoContent} />
              <FaqSection faqs={category.faqs} title={`${category.name}: frequently asked questions`} />
            </>
          ) : null
        }
      />
    </>
  );
}
