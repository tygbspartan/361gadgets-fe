import type { Metadata } from "next";
import { privatePage } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePage("Categories");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
