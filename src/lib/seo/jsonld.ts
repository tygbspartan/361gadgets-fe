import type { Product } from "@/types/product.types";

export const SITE_URL = "https://www.361gadgets.com";

// NOTE: shipping + return values below are structurally-valid defaults for
// Google's Merchant listings. Adjust returnDays / shippingRate / delivery time
// to 361 Gadgets' real policy when it's finalised.
const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "NP",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 7,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
};

const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: "100",
    currency: "NPR",
  },
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "NP",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 3,
      unitCode: "DAY",
    },
  },
};

function toPriceString(v: unknown): string {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export function buildProductJsonLd(
  product: Product,
  opts: {
    url: string;
    averageRating: number;
    reviewCount: number;
  }
) {
  const images = (product.images ?? [])
    .map((i) => i.imageUrl)
    .filter(Boolean);

  const inStock = (product.stockQuantity ?? 0) > 0;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.metaDescription ||
      product.longDescription ||
      `${product.name} — available at 361 Gadgets.`,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(images.length ? { image: images } : {}),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand.name } }
      : {}),
    offers: {
      "@type": "Offer",
      url: opts.url,
      priceCurrency: "NPR",
      price: toPriceString(product.price),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      hasMerchantReturnPolicy: RETURN_POLICY,
      shippingDetails: SHIPPING_DETAILS,
    },
  };

  // Only emit aggregateRating when there is at least one review — never zero.
  if (opts.reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: opts.averageRating,
      reviewCount: opts.reviewCount,
    };
  }

  return jsonLd;
}

export function buildCollectionPageJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  total: number;
  items: { name: string; slug: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.total,
      itemListElement: opts.items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/product/${p.slug}`,
        name: p.name,
      })),
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
