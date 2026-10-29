"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { ROUTES } from "@/constants/routes";
import FooterLink from "@/components/layout/FooterLink";

type SitemapLink = { label: string; href: string };

const ACCOUNT_LINKS: SitemapLink[] = [
  { label: "My Orders", href: ROUTES.ORDERS_HISTORY },
  { label: "My Reviews", href: ROUTES.MY_REVIEWS },
  { label: "Profile Settings", href: ROUTES.PROFILE },
];

const GUEST_LINKS: SitemapLink[] = [
  { label: "Login", href: ROUTES.LOGIN },
  { label: "Sign Up", href: ROUTES.REGISTER },
];

const LEGAL_LINKS: SitemapLink[] = [
  { label: "Policies", href: ROUTES.POLICIES },
  { label: "Terms & Conditions", href: ROUTES.TERMS },
];

/* Account pages when signed in, Login / Sign Up otherwise, then legal —
   left-aligned within each column, with the pair centred as one block on
   narrow screens. */
export default function FooterSitemap() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const columns = [isAuthenticated ? ACCOUNT_LINKS : GUEST_LINKS, LEGAL_LINKS];

  return (
    <nav
      aria-label="Footer"
      className="mx-auto mt-6 grid w-fit grid-cols-[auto_auto] gap-x-12 text-left font-inter text-base sm:gap-x-16 md:mx-0"
    >
      {columns.map((column, i) => (
        <ul key={i} className="space-y-1.5">
          {column.map((link) => (
            <li key={link.href}>
              <FooterLink href={link.href}>{link.label}</FooterLink>
            </li>
          ))}
        </ul>
      ))}
    </nav>
  );
}
