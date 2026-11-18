import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, Wallet, RotateCcw } from "lucide-react";
import { publicPage } from "@/lib/seo/metadata";
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import AboutSection from "@/components/home/AboutSection";
import { getTopCategories } from "@/lib/server/catalog";
import { CONTACT } from "@/config/brand";
import { ROUTES } from "@/constants/routes";

export const revalidate = 3600;

export const metadata: Metadata = publicPage({
  title: "About 361 Gadgets: Genuine Gadget Store in Kathmandu, Nepal",
  absoluteTitle: true,
  description:
    "361 Gadgets is a Kathmandu-based online store for genuine gadgets and tech accessories, with cash on delivery, eSewa and delivery to all 77 districts of Nepal.",
  path: "/about",
});

/* Why shop here. Every line must stay true to how the store works. */
const REASONS = [
  {
    icon: ShieldCheck,
    title: "100% genuine products",
    text: "Everything we sell is original and brand new. No copies, no first copies, and no refurbished units passed off as new.",
  },
  {
    icon: Truck,
    title: "Delivery across Nepal",
    text: "We deliver inside Kathmandu Valley and to every one of Nepal's 77 districts.",
  },
  {
    icon: Wallet,
    title: "Cash on delivery or eSewa",
    text: "Pay when your order arrives, or pay with eSewa. No card needed.",
  },
  {
    icon: RotateCcw,
    title: "Easy 7-day returns",
    text: "If an item arrives unused and in its original packaging, you can return it within 7 days of delivery.",
  },
];

const sectionTitle = "font-montserrat text-[20px] font-semibold text-[#111111] lg:text-[24px]";

export default async function AboutPage() {
  const categories = await getTopCategories(6);
  const url = `${SITE_URL}/about`;

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About 361 Gadgets",
          url,
          about: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: "About us", url }])} />

      <div className="page-wrapper">
        <AboutSection headingLevel={1} />
      </div>

      {/* Why shop with us */}
      <section className="page-wrapper mt-17.5" aria-labelledby="why-heading">
        <h2 id="why-heading" className={sectionTitle}>
          Why shop with 361 Gadgets
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {REASONS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="surface-card rounded-2xl p-5 lg:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-accent)_10%,transparent)]">
                <Icon className="h-5 w-5 text-(--brand-accent)" />
              </span>
              <h3 className="mt-4 font-montserrat text-[16px] font-semibold text-[#111111]">{title}</h3>
              <p className="mt-2 font-inter text-[14px] leading-6 text-[#555555]">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* What we sell */}
      {categories.length > 0 && (
        <section className="page-wrapper mt-17.5" aria-labelledby="sell-heading">
          <h2 id="sell-heading" className={sectionTitle}>
            What we sell
          </h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`${ROUTES.CATEGORY}/${c.slug}`}
                  className="inline-block rounded-full border border-(--hairline-strong) px-5 py-2.5 font-inter text-[14px] font-medium text-[#111111] transition-colors hover:border-[#111111]"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={ROUTES.BRANDS}
                className="inline-block rounded-full border border-(--hairline-strong) px-5 py-2.5 font-inter text-[14px] font-medium text-[#111111] transition-colors hover:border-[#111111]"
              >
                All brands
              </Link>
            </li>
          </ul>
        </section>
      )}

      {/* Where we are */}
      <section className="page-wrapper mt-17.5" aria-labelledby="where-heading">
        <div className="rounded-2xl bg-[#F5F5F5] px-6 py-8 lg:px-10 lg:py-10">
          <h2 id="where-heading" className={sectionTitle}>
            Where to find us
          </h2>
          <p className="mt-3 max-w-2xl font-inter text-[14px] leading-6 text-[#555555] lg:text-[15px]">
            We&apos;re based in {CONTACT.address}. Order online any time, or get in touch with questions
            about a product, an order or delivery.
          </p>
          <Link
            href={ROUTES.CONTACT}
            className="hero-btn mt-6 inline-flex items-center rounded-full bg-[#111111] px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-white lg:text-[14px]"
          >
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
