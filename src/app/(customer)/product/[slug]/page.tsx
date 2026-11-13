import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import {
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
  getShippingRates,
} from "@/lib/server/catalog";
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildProductDescription,
  SITE_URL,
} from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";
import FaqSection from "@/components/seo/FaqSection";
import ProductDetails from "@/components/productDetailPage/ProductDetails";
import ProductSpecifications from "@/components/productDetailPage/ProductSpecifications";
import SimilarProducts from "@/components/productDetailPage/SimilarProducts";
import ProductReviewsList from "@/components/productDetailPage/ProductReviewsList";
import ProductReviewsInteractive from "@/components/productDetailPage/ProductReviewsInteractive";

// ── SEO metadata (shares the cached product fetch with the page) ──────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  // Missing: the page calls notFound(); title the 404 to match.
  if (!product) return { title: "Page not found", robots: { index: false } };

  const title = product.metaTitle?.trim() || product.name;
  const description = buildProductDescription(product);
  const primaryImage =
    product.images?.find((i) => i.isPrimary)?.imageUrl ?? product.images?.[0]?.imageUrl;

  return {
    title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${slug}`,
      type: "website",
      images: primaryImage ? [{ url: primaryImage, alt: product.name }] : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage ?? DEFAULT_OG_IMAGE.url],
    },
  };
}

// Category chain (L1 → L2 → L3) from the product's category parent chain.
type CatNode = { name: string; slug: string; parent?: CatNode | null };
function buildChain(cat: CatNode | null | undefined) {
  const chain: { name: string; slug: string }[] = [];
  let c = cat;
  while (c) {
    chain.unshift({ name: c.name, slug: c.slug });
    c = c.parent ?? null;
  }
  return chain;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviewData, related, shipping] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(
      product.categoryId ?? null,
      (product.category as unknown as { parentId?: number | null })?.parentId ?? null,
      product.id
    ),
    getShippingRates(),
  ]);

  const { reviews, summary } = reviewData;
  const reviewerIds = reviews.map((r) => r.userId);

  const chain = buildChain(product.category as unknown as CatNode);
  const productUrl = `${SITE_URL}/product/${slug}`;

  const productJsonLd = buildProductJsonLd(product, {
    url: productUrl,
    averageRating: summary.averageRating,
    reviewCount: summary.totalReviews,
    shipping,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    ...chain.map((c) => ({
      name: c.name,
      url: `${SITE_URL}${ROUTES.CATEGORY}/${c.slug}`,
    })),
    { name: product.name, url: productUrl },
  ]);

  return (
    <div className="page-wrapper space-y-12.5">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <ProductDetails product={product} summary={summary} />

      <ProductSpecifications product={product} />

      {/* Optional, set per product in the admin. */}
      <FaqSection faqs={product.faqs} />

      <SimilarProducts products={related} />

      <ProductReviewsList reviews={reviews} />

      <ProductReviewsInteractive
        productId={product.id}
        reviewerIds={reviewerIds}
        categorySlug={product.category?.slug ?? null}
      />
    </div>
  );
}
