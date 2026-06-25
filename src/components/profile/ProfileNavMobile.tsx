"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { label: "My Profile", href: ROUTES.PROFILE, icon: "iconoir:profile-circle" },
  { label: "My Orders", href: ROUTES.ORDERS_HISTORY, icon: "lets-icons:order-light" },
  { label: "My Reviews", href: ROUTES.MY_REVIEWS, icon: "carbon:review" },
];

// Mobile-only "User Settings" dropdown that replaces the desktop sidebar nav.
export default function ProfileNavMobile() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden relative w-fit">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-[#D4D4D4] rounded-[5px] p-1.25"
      >
        <Icon icon="lsicon:setting-outline" width={16} height={16} className="text-black" />
        <span className="font-inter font-normal text-[12px] leading-7 text-black align-middle">
          User Settings
        </span>
      </button>

      {open && (
        <>
          {/* Click-outside catcher */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 min-w-44 bg-white border border-[#D4D4D4] rounded-[5px] shadow-md overflow-hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 font-inter font-medium text-[12px] transition-colors ${
                    isActive ? "text-primary" : "text-black hover:bg-gray-50"
                  }`}
                >
                  <Icon icon={item.icon} width={16} height={16} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
