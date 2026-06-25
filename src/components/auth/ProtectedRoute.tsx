"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { ROUTES } from "@/constants/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else if (requireAdmin && user?.role !== "admin") {
        router.push(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, user, isLoading, requireAdmin, router]);

  // Show loading spinner while checking auth
  if (
    isLoading ||
    !isAuthenticated ||
    (requireAdmin && user?.role !== "admin")
  ) {
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
