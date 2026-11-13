import { getBrandBySlug } from "@/lib/server/catalog";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/ogImage";

export const alt = "Brand at 361 Gadgets";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return renderOgImage({
    eyebrow: "Genuine products in Nepal",
    title: brand?.name ?? "361 Gadgets",
  });
}
