"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Footer sitemap link; the page you're on is set in bold italic. */
export default function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`transition-colors hover:text-white ${active ? "font-bold italic text-white" : ""}`}
    >
      {children}
    </Link>
  );
}
