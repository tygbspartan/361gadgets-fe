import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/constants/routes";

/*
 * Shown when no hero banners are configured in the CMS. Matches HeroSlider's
 * full-bleed, full-height stage so the section never changes height between the
 * populated and empty states. Background is left transparent so HeroSection's
 * floor grid shows through.
 */
export default function HeroFallback() {
  return (
    <div className="relative w-full h-svh overflow-hidden">
      <div className="page-wrapper flex h-full items-center justify-center">
        <div className="relative flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-(--hairline) bg-white px-3.5 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="font-inter text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
              No fakes. Only originals.
            </span>
          </span>

          <h1 className="mt-6 font-montserrat font-bold uppercase tracking-[-0.01em] text-[32px] leading-[1.05] sm:text-[48px] lg:text-[68px] text-foreground">
            100% Genuine.
            <br />
            <span className="text-gray-400">Zero Compromise.</span>
          </h1>

          <p className="mt-5 max-w-xl font-inter text-[13px] lg:text-[16px] leading-relaxed text-gray-500">
            {BRAND.description.trim()}
          </p>

          <Link
            href={ROUTES.PRODUCTS}
            className="btn-accent mt-8 inline-flex items-center gap-2 rounded-[10px] px-7 py-3 font-montserrat text-[13px] lg:text-[15px] font-semibold uppercase tracking-[0.08em]"
          >
            Shop All Gear
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
