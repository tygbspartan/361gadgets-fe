import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Vendor management is superadmin-only. The parent admin layout already
// guards `requireAdmin`; this tightens it to the platform operator.
export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireSuperadmin={true}>{children}</ProtectedRoute>;
}
