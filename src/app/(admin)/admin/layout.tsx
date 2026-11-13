import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminShell from "@/components/layout/AdminShell";
import { ToastProvider } from "@/components/ui/ToastStack";
import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: { default: "Admin dashboard", template: "%s · Admin | 361 Gadgets" },
  robots: PRIVATE_ROBOTS,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </ProtectedRoute>
  );
}
