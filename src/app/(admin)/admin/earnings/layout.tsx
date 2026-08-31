import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Vendor earnings/payouts are superadmin-only. The parent admin layout already
// guards `requireAdmin`; this tightens it to the platform operator.
export default function EarningsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireSuperadmin={true}>{children}</ProtectedRoute>;
}
