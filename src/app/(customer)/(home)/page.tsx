import type { Metadata } from "next";
import { publicPage } from "@/lib/seo/metadata";
import HomePageContent from "@/components/home/HomePageContent";
import { getHomeData } from "@/lib/server/catalog";

// Built on the server with its data (ISR): refreshed hourly, or right away when
// the backend reports a catalog change (POST /api/revalidate).
export const revalidate = 3600;
export const metadata: Metadata = publicPage({
  title: "361 Gadgets | Genuine Tech & Gadgets in Nepal",
  absoluteTitle: true,
  description:
    "Shop genuine gadgets and tech online in Nepal: phones, earbuds, laptops, gaming gear, smart devices and accessories from trusted brands, delivered to your door.",
  path: "/",
});

export default async function HomePage() {
  const data = await getHomeData();
  return <HomePageContent data={data} />;
}
