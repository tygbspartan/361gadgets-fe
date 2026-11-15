import type { Faq } from "@/types/product.types";
import JsonLd from "./JsonLd";
import { buildFaqJsonLd } from "@/lib/seo/jsonld";

/*
 * FAQ accordion for category and product pages, plus its FAQPage schema.
 * Native <details>, so it works without JavaScript and every answer is in the
 * HTML that search engines read (collapsed answers still count).
 */
export default function FaqSection({
  faqs,
  title = "Frequently asked questions",
}: {
  faqs: Faq[] | null | undefined;
  title?: string;
}) {
  const items = (faqs ?? []).filter((f) => f.question?.trim() && f.answer?.trim());
  if (!items.length) return null;

  return (
    <section aria-labelledby="faq-heading">
      <JsonLd data={buildFaqJsonLd(items)} />
      <div className="w-fit mx-auto lg:mx-0 mb-5">
        <h2
          id="faq-heading"
          className="font-montserrat font-medium text-[18px] lg:text-2xl leading-tight text-black text-center lg:text-left"
        >
          {title}
        </h2>
        <div className="heading-rule -mx-4 mt-1.5" />
      </div>
      <div className="border border-[#E5E5E5] rounded-[6px] divide-y divide-[#EFEFEF]">
        {items.map((faq, i) => (
          <details key={i} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-3.5 hover:bg-[#FAFAFA] [&::-webkit-details-marker]:hidden">
              <h3 className="font-montserrat text-[14px] lg:text-[15px] font-medium leading-snug text-[#111111]">
                {faq.question.trim()}
              </h3>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-[18px] leading-none text-[#555555] transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-4 pb-4 font-inter text-[13px] lg:text-[14px] leading-6 text-[#4B4B4B] whitespace-pre-line">
              {faq.answer.trim()}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
