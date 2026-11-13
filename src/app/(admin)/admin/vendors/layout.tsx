import ProtectedRoute from "@/components/auth/ProtectedRoute";
import type { Metadata } from "next";
import { privatePage } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePage("Vendors");

// Vendor management is superadmin-only. The parent admin layout already
// guards `requireAdmin`; this tightens it to the platform operator.
export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireSuperadmin={true}>{children}</ProtectedRoute>;
}
