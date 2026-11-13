import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FlyProvider } from "@/components/providers/FlyProvider";
import { ToastProvider } from "@/components/ui/ToastStack";
import CursorFollower from "@/components/ui/CursorFollower";
import { ROUTES } from "@/constants/routes";
import { getTopCategories } from "@/lib/server/catalog";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/*
 * Site-wide 404: unmatched URLs and every notFound() (missing product,
 * category, brand). It renders under the root layout only, so it brings the
 * storefront chrome itself (no PageLoader: nothing here is worth waiting for).
 *
 * Styled as the homepage hero's board — same greys (the .hero tokens), same
 * uppercase headline with the accent full stop — but the circuit is broken:
 * two traces that don't meet, with a spark across the gap.
 */
export default async function NotFound() {
  const categories = await getTopCategories();

  return (
    <ToastProvider>
      <FlyProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          {/* -mt-12.5 cancels the Navbar's bottom margin, as the homepage does, so
              the grey board starts right under the bar. */}
          <main className="hero -mt-12.5 flex-1 bg-(--hero-bg)">
            <section className="page-wrapper flex min-h-[calc(100dvh-var(--nav-h))] flex-col items-center justify-center py-14 text-center">
              <BrokenTrace />

              <p className="mt-8 font-inter text-[11px] font-medium uppercase tracking-[0.22em] text-[#555555]">
                Error 404
              </p>
              <h1 className="mt-4 font-montserrat text-[clamp(32px,5vw,64px)] font-bold uppercase leading-[0.98] tracking-[-0.02em] text-[#111111]">
                <span className="block">Page not found.</span>
                <span className="block text-[#8A8A8A]">
                  Connection lost<span className="text-(--hero-accent)">.</span>
                </span>
              </h1>
              <p className="mt-6 max-w-md font-inter text-[14px] leading-relaxed text-[#555555] lg:text-[16px]">
                The page you&apos;re looking for has moved, been removed, or never existed.
                Let&apos;s get you back to the good stuff.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={ROUTES.PRODUCTS}
                  className="hero-btn inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-white lg:text-[14px]"
                >
                  Shop all gear
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={ROUTES.HOME}
                  className="hero-btn inline-flex items-center gap-2 rounded-full border border-[#111111]/25 px-8 py-3.5 font-montserrat text-[13px] font-semibold uppercase tracking-[0.08em] text-[#111111] lg:text-[14px]"
                >
                  Back to home
                </Link>
              </div>

              {categories.length > 0 && (
                <nav aria-label="Popular categories" className="mt-12 w-full max-w-2xl border-t border-(--hero-trace) pt-8">
                  <p className="font-inter text-[11px] font-medium uppercase tracking-[0.22em] text-[#555555]">
                    Or browse a category
                  </p>
                  <ul className="mt-4 flex flex-wrap justify-center gap-2">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`${ROUTES.CATEGORY}/${category.slug}`}
                          className="inline-block rounded-full border border-(--hero-node) bg-white/60 px-4 py-2 font-inter text-[13px] text-[#111111] transition-colors hover:border-[#111111] hover:bg-white"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </section>
          </main>
          <Footer />
        </div>
        <CursorFollower />
      </FlyProvider>
    </ToastProvider>
  );
}

/* Two circuit traces reaching for each other and missing, with a spark in the
   gap. Greys from the hero board; the spark flickers (held still under
   reduced motion, see .nf-spark in globals.css). */
function BrokenTrace() {
  return (
    <svg
      viewBox="0 0 560 140"
      className="w-[min(560px,100%)]"
      aria-hidden
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Faint background traces */}
      <g stroke="var(--hero-trace)" strokeWidth="1.5">
        <path d="M0 22 H120 L150 52 H205" />
        <path d="M560 118 H440 L410 88 H355" />
        <path d="M30 128 H170" />
        <path d="M390 12 H530" />
      </g>
      <g fill="var(--hero-bg)" stroke="var(--hero-node)" strokeWidth="1.5">
        <circle cx="205" cy="52" r="4" />
        <circle cx="355" cy="88" r="4" />
        <circle cx="170" cy="128" r="4" />
        <circle cx="390" cy="12" r="4" />
      </g>

      {/* The broken connection */}
      <g stroke="#9a9a9a" strokeWidth="2.5">
        <path d="M0 70 H150 L176 70 L196 84 H244" />
        <path d="M560 70 H410 L384 70 L364 56 H316" />
      </g>
      <g fill="var(--hero-bg)" stroke="#9a9a9a" strokeWidth="2.5">
        <circle cx="250" cy="84" r="6" />
        <circle cx="310" cy="56" r="6" />
      </g>

      {/* Spark across the gap */}
      <g className="nf-spark" stroke="var(--hero-accent)" strokeWidth="2.5">
        <path d="M268 80 L278 66 L284 76 L294 60" />
        <path d="M262 64 L268 68" opacity="0.6" />
        <path d="M298 76 L292 72" opacity="0.6" />
      </g>
    </svg>
  );
}
