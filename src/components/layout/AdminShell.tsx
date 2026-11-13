"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

/*
 * Admin frame: sidebar, header and the scrolling page area. From lg (1024px)
 * the sidebar sits beside the page as before; below that it is a drawer the
 * header's menu button slides in, so phone and tablet pages get the full
 * width instead of what's left beside a 256px sidebar.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const close = () => setNavOpen(false);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      <AdminSidebar open={navOpen} onClose={close} />

      {/* Drawer backdrop, below lg only. */}
      {navOpen && (
        <div aria-hidden className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} />
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader navOpen={navOpen} onMenuClick={() => setNavOpen(true)} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
