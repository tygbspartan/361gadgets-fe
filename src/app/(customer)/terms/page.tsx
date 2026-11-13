import type { Metadata } from "next";
import { publicPage } from "@/lib/seo/metadata";
import { SITE_URL, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import { termsContent } from "@/content/terms";

const TITLE = "Terms and Conditions";
const DESCRIPTION =
  "The terms for shopping at 361 Gadgets: orders, pricing, payment, delivery across Nepal, returns within 7 days and refunds.";

export const metadata: Metadata = publicPage({ title: TITLE, description: DESCRIPTION, path: "/terms" });

export default function TermsPage() {
  return (
    <div className="page-wrapper">
      <JsonLd data={buildWebPageJsonLd({ name: TITLE, description: DESCRIPTION, path: "/terms" })} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: TITLE, url: `${SITE_URL}/terms` },
        ])}
      />
      <h1 className="font-montserrat font-semibold text-[28px] leading-[130%] tracking-[-0.01em] text-center text-black">
        Terms and Conditions
      </h1>

      <div className="mt-5 flex flex-col gap-4">
        {termsContent.map((item, i) => (
          <p key={i} className="font-montserrat text-[12px] lg:text-[16px] leading-[31px] text-justify text-[#2D2D2D]">
            <span className="font-semibold">{i + 1}. {item.key}: </span>
            <span className="font-normal">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
