import type { Metadata } from "next";
import { publicPage } from "@/lib/seo/metadata";
import HomePageContent from "@/components/home/HomePageContent";
import { getHomeData } from "@/lib/server/catalog";

// Built on the server with its data (ISR): refreshed hourly, or right away when
// the backend reports a catalog change (POST /api/revalidate).
export const revalidate = 3600;
export const metadata: Metadata = publicPage({
  title: "361 Gadgets Nepal: Buy Gadgets & Accessories Online in Nepal",
  absoluteTitle: true,
  description:
    "Buy genuine gadgets online from 361 Gadgets Nepal, the online gadget store. Browse earbuds, speakers, smart watches, power banks, gaming gear and more.",
  path: "/",
});

export default async function HomePage() {
  const data = await getHomeData();
  return <HomePageContent data={data} />;
}
