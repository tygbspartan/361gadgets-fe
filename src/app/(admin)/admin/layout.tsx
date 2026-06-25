import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Header */}
          <AdminHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0">
            <div className="max-w-full">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
