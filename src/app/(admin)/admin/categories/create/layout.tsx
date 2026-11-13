import ProtectedRoute from "@/components/auth/ProtectedRoute";
import type { Metadata } from "next";
import { privatePage } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePage("Add categories");

// Creating categories is superadmin-only; vendors request via /admin/categories.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireSuperadmin>{children}</ProtectedRoute>;
}
