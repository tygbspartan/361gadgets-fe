"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function AdminHeader({
  navOpen,
  onMenuClick,
}: {
  navOpen: boolean;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-3 h-full px-4 sm:px-6">
        {/* Menu button (opens the sidebar drawer below lg) + page title */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            aria-controls="admin-nav"
            aria-expanded={navOpen}
            className="-ml-2 rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="truncate text-base font-semibold text-gray-800 sm:text-lg">Admin Panel</h2>
        </div>

        {/* User Info & Logout */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* User Info — the name hides on phones; the role chip stays */}
          <div className="flex items-center gap-2 text-sm">
            <User className="hidden h-4 w-4 text-gray-500 sm:block" />
            <span className="hidden max-w-40 truncate font-medium text-gray-700 sm:inline">
              {user?.companyName || user?.firstName || user?.email}
            </span>
            {user?.role && (
              <span
                className={
                  "px-2 py-0.5 rounded-full text-xs font-medium " +
                  (user.role === "superadmin"
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-700")
                }
              >
                {user.role === "superadmin" ? "Superadmin" : "Vendor"}
              </span>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
