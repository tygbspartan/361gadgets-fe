"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { ROUTES } from "@/constants/routes";
import { isPrivileged, isSuper } from "@/constants/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Requires a privileged user — vendor (admin) OR superadmin. */
  requireAdmin?: boolean;
  /** Requires the platform operator (superadmin) specifically. */
  requireSuperadmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSuperadmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const role = user?.role;
  const lacksAdmin = requireAdmin && !isPrivileged(role);
  const lacksSuper = requireSuperadmin && !isSuper(role);
  const blocked = lacksAdmin || lacksSuper;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else if (blocked) {
        // Authenticated but wrong role — send privileged users to their
        // dashboard, everyone else home.
        router.push(isPrivileged(role) ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME);
      }
    }
  }, [isAuthenticated, isLoading, blocked, role, router]);

  // Show loading spinner while checking auth / before the redirect lands
  if (isLoading || !isAuthenticated || blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
