import type { Metadata } from "next";
import { privatePage } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePage("Account settings");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
