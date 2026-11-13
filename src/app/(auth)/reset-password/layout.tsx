import type { Metadata } from "next";
import { privatePage, FORM_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePage("Reset password", FORM_ROBOTS);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
