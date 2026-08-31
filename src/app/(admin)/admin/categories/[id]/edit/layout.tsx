import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Editing categories is superadmin-only.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireSuperadmin>{children}</ProtectedRoute>;
}
