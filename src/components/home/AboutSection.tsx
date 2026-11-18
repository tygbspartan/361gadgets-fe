import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CONTACT } from "@/config/brand";
import { ROUTES } from "@/constants/routes";

/*
 * "Who we are" band on the homepage: photo on the left, story on the right
 * (stacked on mobile, photo first). Static copy, kept in ABOUT below so it can
 * be edited in one place. Every claim here must stay true to how the store
 * actually works (payment options, returns, delivery).
 *
 * The photo is a placeholder: drop the real image into /public/images/about/
 * and point ABOUT.image.src at it (keep the alt text descriptive).
 */
const ABOUT = {
  eyebrow: "About 361 Gadgets",
  heading: "Your Trusted Gadget Store in Nepal",
  paragraphs: [
    "361 Gadgets is a Kathmandu-based online store for genuine gadgets and tech accessories. From smartphones, wireless earbuds and smart watches to power banks, chargers, laptop accessories and gaming gear, everything we sell is original. No copies, no first copies, and no refurbished units passed off as new.",
    "We believe buying tech in Nepal should be simple and safe. Prices are clear, products come with the brand's warranty where it applies, and we deliver to every district in Nepal, from Kathmandu Valley to Biratnagar, Pokhara and beyond.",
  ],
  points: [
    "100% genuine products",
    "Delivery across all 77 districts",
    "Cash on delivery and eSewa",
    "Easy 7-day returns",
  ],
  image: {
    src: "/images/about/about-placeholder.svg",
    alt: "361 Gadgets, genuine gadgets and tech accessories in Kathmandu, Nepal",
  },
};

/* On the homepage the heading is an h2; on /about it is the page's h1. */
export default function AboutSection({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section aria-labelledby="about-heading">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[#ececec] lg:aspect-square">
          <Image
            src={ABOUT.image.src}
            alt={ABOUT.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            unoptimized={ABOUT.image.src.endsWith(".svg")}
          />
        </div>

        <div className="max-w-xl">
          <p className="font-inter text-[11px] font-medium uppercase tracking-[0.22em] text-[#555555] lg:text-[12px]">
            {ABOUT.eyebrow}
          </p>
          <Heading
            id="about-heading"
            className="mt-3 font-montserrat text-[28px] font-bold uppercase leading-[1.02] tracking-[-0.02em] text-[#111111] sm:text-[34px] lg:text-[42px] xl:text-[48px]"
          >
            {ABOUT.heading}
            <span className="text-(--brand-accent)">.</span>
          </Heading>

          <div className="mt-5 space-y-4 font-inter text-[14px] leading-relaxed text-[#555555] lg:mt-6 lg:text-[16px]">
            {ABOUT.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {ABOUT.points.map((point) => (
              <li key={point} className="flex items-center gap-2.5 font-inter text-[13px] font-medium text-[#111111] lg:text-[14px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-accent)_12%,transparent)]">
                  <Check className="h-3 w-3 text-(--brand-accent)" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href={ROUTES.PRODUCTS}
              className="hero-btn inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-white lg:text-[14px]"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${CONTACT.phone.tel}`}
              className="font-montserrat text-[12px] font-semibold uppercase tracking-[0.12em] text-[#111111] underline-offset-4 hover:underline lg:text-[13px]"
            >
              Call {CONTACT.phone.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
