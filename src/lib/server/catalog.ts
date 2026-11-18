import { cache } from "react";
import { serverApiBase } from "@/lib/serverApi";

/** Every catalog fetch carries this tag; POST /api/revalidate (called by the
 *  backend when products, categories or brands change) expires them all. */
export const CATALOG_TAG = "catalog";
import type { Faq, Product } from "@/types/product.types";
import { DEFAULT_SHIPPING, type ShippingRates } from "@/lib/seo/jsonld";
import type { ProductReviewsResponse } from "@/types/review.types";

export type ProductReviewsData = ProductReviewsResponse["data"];

// react cache() dedupes within a single render pass, so generateMetadata and the
// page component share one network request per product.

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(
        `${base}/products/slug/${encodeURIComponent(slug)}`,
        { next: { revalidate: 3600, tags: [CATALOG_TAG, `product:${slug}`] } }
      );
      if (!res.ok) return null; // 404 (inactive/missing) or upstream error
      const json = await res.json();
      return (json?.data as Product) ?? null;
    } catch {
      return null;
    }
  }
);

const EMPTY_REVIEWS: ProductReviewsData = {
  reviews: [],
  summary: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
};

export const getProductReviews = cache(
  async (productId: number): Promise<ProductReviewsData> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(`${base}/reviews/product/${productId}`, {
        next: { revalidate: 3600, tags: [CATALOG_TAG, `product-reviews:${productId}`] },
      });
      if (!res.ok) return EMPTY_REVIEWS;
      const json = await res.json();
      return (json?.data as ProductReviewsData) ?? EMPTY_REVIEWS;
    } catch {
      return EMPTY_REVIEWS;
    }
  }
);

// ── Category / Brand pages ────────────────────────────────────────────────

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  seoDescription: string | null;
  seoContent?: string | null;
  faqs?: Faq[] | null;
  level: number;
  parentId: number | null;
  parent?: { name: string; slug: string; parent?: CategoryDetail["parent"] } | null;
  productCount?: number;
}

export interface BrandDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  metaTitle?: string | null;
  metaDescription: string | null;
  seoDescription: string | null;
  seoContent?: string | null;
  faqs?: Faq[] | null;
  logoUrl: string | null;
  productCount?: number;
}

export interface ProductsPage {
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const getCategoryBySlug = cache(
  async (slug: string): Promise<CategoryDetail | null> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(`${base}/categories/slug/${encodeURIComponent(slug)}`, {
        next: { revalidate: 3600, tags: [CATALOG_TAG, `category:${slug}`] },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return (json?.data as CategoryDetail) ?? null;
    } catch {
      return null;
    }
  }
);

export const getBrandBySlug = cache(
  async (slug: string): Promise<BrandDetail | null> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(`${base}/brands/slug/${encodeURIComponent(slug)}`, {
        next: { revalidate: 3600, tags: [CATALOG_TAG, `brand:${slug}`] },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return (json?.data as BrandDetail) ?? null;
    } catch {
      return null;
    }
  }
);

/** Lightweight brand list for a filter sidebar. With a category slug, only the
 *  brands that have products in that category (or its subcategories). */
export const getBrandsList = cache(
  async (categorySlug?: string): Promise<{ id: number; name: string; slug: string }[]> => {
    try {
      const base = await serverApiBase();
      const qs = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
      const res = await fetch(`${base}/brands${qs}`, { next: { revalidate: 3600, tags: [CATALOG_TAG] } });
      if (!res.ok) return [];
      const json = await res.json();
      return ((json?.data ?? []) as { id: number; name: string; slug: string }[]).map(
        (b) => ({ id: b.id, name: b.name, slug: b.slug })
      );
    } catch {
      return [];
    }
  }
);

const EMPTY_PAGE: ProductsPage = {
  data: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

/** Server-side product list for a category/brand grid (paginated + sortable). */
export async function getProductsPage(query: Record<string, string | number | undefined>): Promise<ProductsPage> {
  try {
    const base = await serverApiBase();
    const sp = new URLSearchParams();
    sp.set("isActive", "true");
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") sp.set(k, String(v));
    }
    const res = await fetch(`${base}/products?${sp.toString()}`, {
      next: { revalidate: 3600, tags: [CATALOG_TAG] },
    });
    if (!res.ok) return EMPTY_PAGE;
    const json = await res.json();
    return (json?.data as ProductsPage) ?? EMPTY_PAGE;
  } catch {
    return EMPTY_PAGE;
  }
}

/** All active slugs for the sitemap. */
async function getAllSlugs(
  path: string,
  extract: (json: any) => { slug: string; updatedAt?: string }[]
): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const base = await serverApiBase();
    const res = await fetch(`${base}${path}`, { next: { revalidate: 3600, tags: [CATALOG_TAG] } });
    if (!res.ok) return [];
    return extract(await res.json());
  } catch {
    return [];
  }
}

export const getAllCategorySlugs = () =>
  getAllSlugs("/categories", (j) =>
    (j?.data ?? [])
      .filter((c: any) => c?.slug && c?.isActive !== false)
      .map((c: any) => ({ slug: c.slug, updatedAt: c.updatedAt }))
  );

export const getAllBrandSlugs = () =>
  getAllSlugs("/brands", (j) =>
    (j?.data ?? [])
      .filter((b: any) => b?.slug && b?.isActive !== false)
      .map((b: any) => ({ slug: b.slug, updatedAt: b.updatedAt }))
  );

/* The API caps a page at 100 products, so the sitemap walks the pages. The
   first page reports totalPages; the rest are fetched in parallel. */
const SITEMAP_PAGE_SIZE = 100;

export async function getAllProductSlugs(): Promise<
  { slug: string; updatedAt?: string; images?: string[] }[]
> {
  type SlugsPage = {
    data?: {
      data?: { slug?: string; updatedAt?: string; images?: { imageUrl?: string }[] }[];
      pagination?: { totalPages?: number };
    };
  };
  const toSlugs = (j: SlugsPage) =>
    (j?.data?.data ?? []).flatMap((p) =>
      p?.slug
        ? [
            {
              slug: p.slug,
              updatedAt: p.updatedAt,
              images: (p.images ?? []).flatMap((i) => (i?.imageUrl ? [i.imageUrl] : [])).slice(0, 5),
            },
          ]
        : []
    );
  const pagePath = (page: number) =>
    `/products?limit=${SITEMAP_PAGE_SIZE}&page=${page}&isActive=true`;

  try {
    const base = await serverApiBase();
    const res = await fetch(`${base}${pagePath(1)}`, { next: { revalidate: 3600, tags: [CATALOG_TAG] } });
    if (!res.ok) return [];
    const first: SlugsPage = await res.json();
    const totalPages = first?.data?.pagination?.totalPages ?? 1;

    const rest = await Promise.all(
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
        getAllSlugs(pagePath(i + 2), toSlugs)
      )
    );
    return [...toSlugs(first), ...rest.flat()];
  } catch {
    return [];
  }
}

// Related products for the "Similar Products" grid: same L3 category, falling
// back to the L2 parent, excluding the current product. 361 filters by
// categoryId (not slug), matching its /products?categoryId=… endpoint.
export const getRelatedProducts = cache(
  async (
    categoryId: number | null,
    parentCategoryId: number | null,
    currentProductId: number
  ): Promise<Product[]> => {
    const base = await serverApiBase();

    const fetchBy = async (catId: number): Promise<Product[]> => {
      try {
        const res = await fetch(
          `${base}/products?categoryId=${catId}&limit=8&isActive=true`,
          { next: { revalidate: 3600, tags: [CATALOG_TAG] } }
        );
        if (!res.ok) return [];
        const json = await res.json();
        const list: Product[] = json?.data?.data ?? [];
        return list.filter((p) => p.id !== currentProductId).slice(0, 4);
      } catch {
        return [];
      }
    };

    let related = categoryId ? await fetchBy(categoryId) : [];
    if (related.length === 0 && parentCategoryId) related = await fetchBy(parentCategoryId);
    return related;
  }
);

/* Active top-level categories, for quick links (e.g. the 404 page).
   Empty on any failure so the caller can simply omit the section. */
export async function getTopCategories(limit = 6): Promise<{ name: string; slug: string }[]> {
  try {
    const base = await serverApiBase();
    const res = await fetch(`${base}/categories`, { next: { revalidate: 3600, tags: [CATALOG_TAG] } });
    if (!res.ok) return [];
    const json = await res.json();
    type CategoryRow = {
      name: string;
      slug?: string;
      parentId: number | null;
      isActive?: boolean;
      displayOrder?: number;
    };
    const rows: CategoryRow[] = json?.data ?? [];
    return rows
      .filter((c) => c.slug && c.parentId == null && c.isActive !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .slice(0, limit)
      .map((c) => ({ name: c.name, slug: c.slug as string }));
  } catch {
    return [];
  }
}

// Live delivery rates from the public Settings, for the product schema. Falls
// back to the defaults if the API is unreachable.
export const getShippingRates = cache(async (): Promise<ShippingRates> => {
  try {
    const base = await serverApiBase();
    const res = await fetch(`${base}/settings/public`, { next: { revalidate: 3600, tags: [CATALOG_TAG] } });
    if (!res.ok) return DEFAULT_SHIPPING;
    const d = (await res.json())?.data ?? {};
    const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) && v !== null ? Number(v) : fallback);
    return {
      insideValley: num(d.shippingInsideValley, DEFAULT_SHIPPING.insideValley),
      outsideValley: num(d.shippingOutsideValley, DEFAULT_SHIPPING.outsideValley),
      freeOver: num(d.freeShippingThreshold, DEFAULT_SHIPPING.freeOver),
    };
  } catch {
    return DEFAULT_SHIPPING;
  }
});

/* ── Homepage ──────────────────────────────────────────────────────────────
   Everything the homepage sections show, fetched on the server in parallel so
   the sections arrive already rendered in the HTML: no client fetching,
   spinners or re-renders while the page starts up. Each part is empty on
   failure, and the section then simply hides. */

export interface HomeBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

export interface HomeCategoryTile {
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface HomeData {
  bestSellers: Product[];
  newArrivals: Product[];
  specialOffers: Product[];
  spotlight: Product[];
  featuredBrands: HomeBrand[];
  categoryTiles: HomeCategoryTile[];
}

async function getJson<T>(path: string, pick: (json: unknown) => T | undefined, fallback: T): Promise<T> {
  try {
    const base = await serverApiBase();
    const res = await fetch(`${base}${path}`, { next: { revalidate: 3600, tags: [CATALOG_TAG] } });
    if (!res.ok) return fallback;
    return pick(await res.json()) ?? fallback;
  } catch {
    return fallback;
  }
}

const primaryImage = (p?: Product) =>
  p?.images?.find((i) => i.isPrimary)?.imageUrl ?? p?.images?.[0]?.imageUrl ?? null;

async function getCategoryTiles(limit: number): Promise<HomeCategoryTile[]> {
  const top = await getTopCategories(limit);
  return Promise.all(
    top.map(async (c) => {
      const { data } = await getProductsPage({ categorySlug: c.slug, limit: 1 });
      return { name: c.name, slug: c.slug, imageUrl: primaryImage(data[0]) };
    })
  );
}

export const getHomeData = cache(async (): Promise<HomeData> => {
  const [bestSellers, newArrivals, specialOffers, spotlight, featuredBrands, categoryTiles] =
    await Promise.all([
      getProductsPage({ isFeatured: "true", limit: 16 }).then((p) => p.data),
      getProductsPage({ limit: 16, sortBy: "createdAt", sortOrder: "desc" }).then((p) => p.data),
      getJson<Product[]>("/products/discounted?limit=5", (j) => (j as { data?: { data?: Product[] } })?.data?.data, []),
      getProductsPage({ homepageFeature: "true", limit: 10 }).then((p) => p.data),
      getJson<HomeBrand[]>("/brands/featured", (j) => (j as { data?: HomeBrand[] })?.data, []),
      getCategoryTiles(5),
    ]);
  return { bestSellers, newArrivals, specialOffers, spotlight, featuredBrands, categoryTiles };
});

/** Every active brand, A–Z, for the /brands page. */
export async function getAllBrands(): Promise<HomeBrand[]> {
  const brands = await getJson<HomeBrand[]>("/brands", (j) => (j as { data?: HomeBrand[] })?.data, []);
  return brands
    .filter((b) => b.isActive)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}
