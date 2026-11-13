import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/ogImage";

// Default share card for every page without its own (home, terms, policies…).
export const alt = "361 Gadgets: genuine tech and gadgets in Nepal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ eyebrow: "Gadgets in Nepal", title: "Premium tech. Zero compromise" });
}
