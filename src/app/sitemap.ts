import type { MetadataRoute } from "next";
import {
  getAllProductSlugs,
  getAllCategorySlugs,
  getAllBrandSlugs,
} from "@/lib/server/catalog";

const SITE = "https://www.361gadgets.com";

// Regenerate at most hourly so new products/categories/brands appear without a
// redeploy.
export const revalidate = 3600;

// NOTE: this is a single sitemap. If the catalog ever exceeds ~5000 URLs, switch
// to Next's generateSitemaps() to emit a sitemap index (/sitemap/[id].xml).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/policies`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [products, categories, brands] = await Promise.all([
    getAllProductSlugs(),
    getAllCategorySlugs(),
    getAllBrandSlugs(),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE}/category/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE}/brand/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes];
}
