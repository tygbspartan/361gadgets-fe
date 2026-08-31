import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Creating brands is superadmin-only; vendors request via /admin/brands.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireSuperadmin>{children}</ProtectedRoute>;
}
