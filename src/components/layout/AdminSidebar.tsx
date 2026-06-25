"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { BRAND } from "@/config/brand";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  ShoppingCart,
  Tag,
  Star,
  Images,
} from "lucide-react";

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
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Image src={BRAND.logo.primary} alt={BRAND.name} width={90} height={40} className="object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-white"
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
