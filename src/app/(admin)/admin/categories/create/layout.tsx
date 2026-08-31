import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Creating categories is superadmin-only; vendors request via /admin/categories.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireSuperadmin>{children}</ProtectedRoute>;
}
