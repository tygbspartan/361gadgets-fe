import ProtectedRoute from "@/components/auth/ProtectedRoute";
import type { Metadata } from "next";
import { privatePage } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePage("Hero banners");

// Hero banners are platform-wide, so they're superadmin-only. The parent
// admin layout already guards `requireAdmin`; this tightens it to the
// platform operator so vendors can't reach the page directly.
export default function HeroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireSuperadmin={true}>{children}</ProtectedRoute>;
}
