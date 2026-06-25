"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { label: "My Profile", href: ROUTES.PROFILE, icon: "iconoir:profile-circle" },
  { label: "My Orders", href: ROUTES.ORDERS_HISTORY, icon: "lets-icons:order-light" },
  { label: "My Reviews", href: ROUTES.MY_REVIEWS, icon: "carbon:review" },
];

export default function ProfileNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {/* Heading */}
      <div className="w-fit mb-5">
        <h2 className="font-montserrat font-medium text-[20px] leading-7 text-black">
          User Settings
        </h2>
        <div className="h-0.5 bg-primary mt-1" />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 py-3 font-inter font-medium text-[16px] leading-7 transition-colors ${
                  isActive ? "text-primary" : "text-black hover:text-primary"
                }`}
              >
                <Icon icon={item.icon} width={20} height={20} className="shrink-0" />
                {item.label}
              </Link>
              <div className="border-t-[0.5px] border-t-[#B1A6A6]" />
            </div>
          );
        })}
      </nav>
    </div>
  );
}
