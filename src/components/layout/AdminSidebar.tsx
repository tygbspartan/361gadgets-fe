"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { BRAND } from "@/config/brand";
import { useAppSelector } from "@/lib/redux/hooks";
import { isSuper } from "@/constants/roles";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  ShoppingCart,
  Tag,
  Star,
  Images,
  Store,
  Wallet,
  Settings,
} from "lucide-react";

// `superadminOnly` items are hidden from vendors (role "admin").
const navigation = [
  {
    name: "Dashboard",
    href: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: ROUTES.ADMIN_PRODUCTS,
    icon: Package,
  },
  {
    name: "Categories",
    href: ROUTES.ADMIN_CATEGORIES,
    icon: FolderTree,
  },
  {
    name: "Brands",
    href: ROUTES.ADMIN_BRANDS,
    icon: Award,
  },
  {
    name: "Orders",
    href: ROUTES.ADMIN_ORDERS,
    icon: ShoppingCart,
  },
  {
    name: "Discounts",
    href: ROUTES.ADMIN_DISCOUNTS,
    icon: Tag,
  },
  {
    name: "Reviews",
    href: ROUTES.ADMIN_REVIEWS,
    icon: Star,
  },
  {
    name: "Hero Banners",
    href: ROUTES.ADMIN_HERO,
    icon: Images,
    superadminOnly: true,
  },
  {
    name: "Vendors",
    href: ROUTES.ADMIN_VENDORS,
    icon: Store,
    superadminOnly: true,
  },
  {
    name: "Earnings",
    href: ROUTES.ADMIN_EARNINGS,
    icon: Wallet,
    superadminOnly: true,
  },
  {
    name: "Settings",
    href: ROUTES.ADMIN_SETTINGS,
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const navItems = navigation.filter(
    (item) => !item.superadminOnly || isSuper(role)
  );

  // A vendor (non-superadmin) sees their own company branding here; the
  // superadmin keeps the platform logo.
  const showVendorBrand = !isSuper(role) && !!user?.logoUrl;

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen shrink-0">
      {/* Logo — vendor's company logo, or the platform logo for the superadmin */}
      <div className="flex items-center justify-center gap-2 h-16 border-b border-gray-200 px-3">
        {showVendorBrand ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user!.logoUrl as string}
              alt={user?.companyName || "Vendor"}
              className="h-9 w-9 rounded object-contain border shrink-0"
            />
            <span className="text-sm font-semibold text-gray-800 truncate">
              {user?.companyName || user?.firstName || "My Store"}
            </span>
          </>
        ) : (
          <Image
            src={BRAND.logo.primary}
            alt={BRAND.name}
            width={90}
            height={40}
            className="object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-center text-muted-foreground">
          {BRAND.name} Admin Panel
        </p>
      </div>
    </div>
  );
}
