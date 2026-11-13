import { getCategoryBySlug } from "@/lib/server/catalog";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/ogImage";

export const alt = "Category at 361 Gadgets";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return renderOgImage({
    eyebrow: "Shop online in Nepal",
    title: category?.name ?? "361 Gadgets",
  });
}
