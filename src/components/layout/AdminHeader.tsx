"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function AdminHeader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-6">
        {/* Page Title (can be dynamic later) */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 font-medium">
              {user?.firstName || user?.email}
            </span>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
