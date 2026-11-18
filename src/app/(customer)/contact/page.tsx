import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { publicPage } from "@/lib/seo/metadata";
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import { CONTACT, SOCIAL_LINKS } from "@/config/brand";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = publicPage({
  title: "Contact 361 Gadgets: Phone, Email & Address in Kathmandu",
  absoluteTitle: true,
  description: `Contact 361 Gadgets in ${CONTACT.address}, Nepal. Call ${CONTACT.phone.label} or email ${CONTACT.email} about products, orders, delivery and returns.`,
  path: "/contact",
});

// Google Maps: the shop's own link when set, otherwise a search for the address.
const mapHref =
  CONTACT.mapUrl ??
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${CONTACT.address}, Nepal`)}`;

const card = "surface-card rounded-2xl p-5 lg:p-6";
const label = "font-montserrat text-[15px] font-semibold text-[#111111] lg:text-[16px]";
const body = "mt-1.5 font-inter text-[14px] leading-6 text-[#555555] lg:text-[15px]";
const actionLink = "mt-3 inline-block font-inter text-[14px] font-medium text-[#111111] underline underline-offset-4 hover:text-(--brand-accent)";

export default function ContactPage() {
  const url = `${SITE_URL}/contact`;

  return (
    <div className="page-wrapper">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact 361 Gadgets",
          url,
          mainEntity: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: "Contact us", url }])} />

      <div className="flex justify-center">
        <div className="w-fit">
          <h1 className="text-center font-montserrat text-[22px] font-semibold leading-tight text-black lg:text-[28px]">
            Contact Us
          </h1>
          <div className="heading-rule -mx-5 mt-2" />
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-2xl text-center font-inter text-[14px] leading-6 text-[#555555] lg:text-[15px]">
        Questions about a product, an order, delivery or a return? Call, email or message us and
        we&apos;ll help.
      </p>

      <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:gap-5">
        <li className={card}>
          <Phone className="h-5 w-5 text-(--brand-accent)" aria-hidden />
          <h2 className={`mt-3 ${label}`}>Call us</h2>
          <p className={body}>Talk to us about products, prices and your order.</p>
          <a href={`tel:${CONTACT.phone.tel}`} className={actionLink}>
            {CONTACT.phone.label}
          </a>
        </li>

        <li className={card}>
          <Mail className="h-5 w-5 text-(--brand-accent)" aria-hidden />
          <h2 className={`mt-3 ${label}`}>Email us</h2>
          <p className={body}>For order questions, returns and anything in writing.</p>
          <a href={`mailto:${CONTACT.email}`} className={`${actionLink} break-all`}>
            {CONTACT.email}
          </a>
        </li>

        <li className={card}>
          <MapPin className="h-5 w-5 text-(--brand-accent)" aria-hidden />
          <h2 className={`mt-3 ${label}`}>Find us</h2>
          <p className={body}>{CONTACT.address}, Nepal</p>
          <a href={mapHref} target="_blank" rel="noopener noreferrer" className={actionLink}>
            Open in Google Maps
          </a>
        </li>

        <li className={card}>
          {CONTACT.hours ? (
            <>
              <Clock className="h-5 w-5 text-(--brand-accent)" aria-hidden />
              <h2 className={`mt-3 ${label}`}>Opening hours</h2>
              <p className={body}>{CONTACT.hours}</p>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-(--brand-accent)" aria-hidden />
              <h2 className={`mt-3 ${label}`}>Shop online any time</h2>
              <p className={body}>Orders are open 24/7, and we deliver across all 77 districts of Nepal.</p>
            </>
          )}
        </li>
      </ul>

      {/* Socials */}
      <section className="mx-auto mt-10 max-w-5xl text-center" aria-labelledby="follow-heading">
        <h2 id="follow-heading" className={label}>
          Message us on social media
        </h2>
        <ul className="mt-4 flex justify-center gap-3">
          {SOCIAL_LINKS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-(--hairline-strong) text-[#111111] transition-colors hover:border-[#111111]"
              >
                <Icon icon={s.icon} width={20} height={20} />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick answers */}
      <section className="mx-auto mt-12 max-w-5xl rounded-2xl bg-[#F5F5F5] px-6 py-8 lg:px-10" aria-labelledby="help-heading">
        <h2 id="help-heading" className={label}>
          Looking for something specific?
        </h2>
        <ul className="mt-3 space-y-2 font-inter text-[14px] leading-6 text-[#555555] lg:text-[15px]">
          <li>
            Track or review an order in{" "}
            <Link href={ROUTES.ORDERS_HISTORY} className="font-medium text-[#111111] underline underline-offset-4">
              My Orders
            </Link>
            .
          </li>
          <li>
            Delivery, payment and returns are explained in our{" "}
            <Link href={ROUTES.POLICIES} className="font-medium text-[#111111] underline underline-offset-4">
              Policies
            </Link>
            .
          </li>
          <li>
            Browse{" "}
            <Link href={ROUTES.PRODUCTS} className="font-medium text-[#111111] underline underline-offset-4">
              all products
            </Link>{" "}
            or{" "}
            <Link href={ROUTES.BRANDS} className="font-medium text-[#111111] underline underline-offset-4">
              shop by brand
            </Link>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}
