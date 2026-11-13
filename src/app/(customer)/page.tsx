import type { Metadata } from "next";
import { publicPage } from "@/lib/seo/metadata";
import HomePageContent from "@/components/home/HomePageContent";

// The homepage sections are client components; this server wrapper exists so
// the page can declare its own metadata (canonical URL, share card).
export const metadata: Metadata = publicPage({
  title: "361 Gadgets | Genuine Tech & Gadgets in Nepal",
  absoluteTitle: true,
  description:
    "Shop genuine gadgets and tech online in Nepal: phones, earbuds, laptops, gaming gear, smart devices and accessories from trusted brands, delivered to your door.",
  path: "/",
});

export default function HomePage() {
  return <HomePageContent />;
}
