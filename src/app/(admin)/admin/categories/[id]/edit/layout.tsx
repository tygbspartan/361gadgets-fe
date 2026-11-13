import ProtectedRoute from "@/components/auth/ProtectedRoute";
import type { Metadata } from "next";
import { privatePage } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePage("Edit category");

// Editing categories is superadmin-only.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireSuperadmin>{children}</ProtectedRoute>;
}
