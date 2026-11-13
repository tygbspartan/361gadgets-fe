import type { Faq, Product } from "@/types/product.types";
import { BRAND, CONTACT, SOCIAL_LINKS } from "@/config/brand";

export const SITE_URL = "https://www.361gadgets.com";
export const SITE_NAME = BRAND.name;

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/* Delivery rates from the public Settings (same numbers checkout charges). */
export interface ShippingRates {
  insideValley: number;
  outsideValley: number;
  freeOver: number;
}

// Fallback when Settings can't be loaded; mirrors constants/checkout.ts.
export const DEFAULT_SHIPPING: ShippingRates = {
  insideValley: 100,
  outsideValley: 200,
  freeOver: 10000,
};

/* Kathmandu Valley postcodes: Kathmandu 446xx, Lalitpur 447xx, Bhaktapur 448xx.
   (Neighbouring districts sit outside the range: Makwanpur 441xx, Nuwakot 449xx,
   Kavre 452xx.) Lets Google show the valley rate to valley shoppers. */
const VALLEY_POSTCODES = { postalCodeBegin: "44600", postalCodeEnd: "44899" };

/** Strips tags and collapses whitespace, for descriptions in meta/schema. */
export function toPlainText(text: string | null | undefined): string {
  return (text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Cuts at a word boundary so a description never ends mid-word. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)).replace(/[\s,.;:—-]+$/, "")}…`;
}

function formatRs(value: unknown): string {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? `Rs. ${n.toLocaleString("en-IN")}` : "";
}

/**
 * Meta description for a product page. Uses the admin's meta description, then
 * the product description; when that is too short to be useful in search
 * results (e.g. "9H tempered glass protector."), it is filled out with the
 * price and how the store delivers.
 */
export function buildProductDescription(product: Product): string {
  const own = toPlainText(product.metaDescription) || toPlainText(product.longDescription);
  if (own.length >= 110) return truncate(own);
  const brand = product.brand?.name;
  const price = formatRs(product.price);
  const pitch = `Buy ${product.name}${brand && !product.name.includes(brand) ? ` by ${brand}` : ""} in Nepal${
    price ? ` for ${price}` : ""
  } at ${SITE_NAME}: genuine, delivered nationwide, cash on delivery.`;
  return truncate(own ? `${own.replace(/[.\s]*$/, ".")} ${pitch}` : pitch);
}

/* Site-wide: the store (an OnlineStore is Google's recommended Organization
   type for shops) and the website, linked by @id. */
export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}${BRAND.logo.primary}`,
        description:
          "Genuine gadgets and tech accessories in Nepal: phones, audio, computers, gaming, smart devices and more, delivered across the country.",
        email: CONTACT.email,
        telephone: CONTACT.phone.tel,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Kalopul",
          addressLocality: "Kathmandu",
          addressRegion: "Bagmati Province",
          addressCountry: "NP",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: CONTACT.phone.tel,
          email: CONTACT.email,
          areaServed: "NP",
          availableLanguage: ["en", "ne"],
        },
        sameAs: SOCIAL_LINKS.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        alternateName: ["361Gadgets", "361 Gadgets Nepal"],
        url: SITE_URL,
        inLanguage: "en-NP",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

function shippingDetails(price: number, rates: ShippingRates) {
  const free = rates.freeOver > 0 && price >= rates.freeOver;
  const deliveryTime = {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
  };
  const rate = (value: number) => ({
    "@type": "MonetaryAmount",
    value: free ? 0 : value,
    currency: "NPR",
  });
  return [
    {
      "@type": "OfferShippingDetails",
      shippingLabel: "Inside Kathmandu Valley",
      shippingRate: rate(rates.insideValley),
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "NP",
        postalCodeRange: VALLEY_POSTCODES,
      },
      deliveryTime,
    },
    {
      "@type": "OfferShippingDetails",
      shippingLabel: "Rest of Nepal",
      shippingRate: rate(rates.outsideValley),
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "NP" },
      deliveryTime,
    },
  ];
}

export function buildProductJsonLd(
  product: Product,
  opts: {
    url: string;
    averageRating: number;
    reviewCount: number;
    shipping?: ShippingRates;
  }
) {
  const images = (product.images ?? []).map((i) => i.imageUrl).filter(Boolean);
  const inStock = (product.stockQuantity ?? 0) > 0;
  const price = Number(product.price);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: truncate(
      toPlainText(product.longDescription) || buildProductDescription(product),
      5000
    ),
    url: opts.url,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(images.length ? { image: images } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(product.countryOfOrigin ? { countryOfOrigin: product.countryOfOrigin } : {}),
    offers: {
      "@type": "Offer",
      url: opts.url,
      priceCurrency: "NPR",
      price: Number.isFinite(price) ? price.toFixed(2) : "0.00",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "OnlineStore", "@id": ORG_ID, name: SITE_NAME, url: SITE_URL },
      shippingDetails: shippingDetails(Number.isFinite(price) ? price : 0, opts.shipping ?? DEFAULT_SHIPPING),
      // No return policy here on purpose: only state one that matches the
      // store's real terms exactly.
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
    isPartOf: { "@id": WEBSITE_ID },
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

/* Plain content pages (terms, privacy policy). */
export function buildWebPageJsonLd(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
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

/* FAQ on a category or product page. Note: Google only shows FAQ rich results
   for a few authoritative sites now, but the markup is still read by search
   and AI engines, and it must match the questions shown on the page. */
export function buildFaqJsonLd(faqs: Faq[] | null | undefined) {
  const items = (faqs ?? []).filter((f) => f.question?.trim() && f.answer?.trim());
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.answer.trim() },
    })),
  };
}
