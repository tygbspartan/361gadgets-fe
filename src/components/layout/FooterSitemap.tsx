"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { ROUTES } from "@/constants/routes";
import FooterLink from "@/components/layout/FooterLink";

type SitemapLink = { label: string; href: string };

const SHOP_LINKS: SitemapLink[] = [
  { label: "All Products", href: ROUTES.PRODUCTS },
  { label: "All Brands", href: ROUTES.BRANDS },
  { label: "About Us", href: ROUTES.ABOUT },
  { label: "Contact Us", href: ROUTES.CONTACT },
];

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

/* Shop pages, then account pages when signed in (Login / Sign Up otherwise),
   then legal. Left-aligned within each column, the columns centred as one
   block on narrow screens. Every page links here, which tells search engines
   these are the site's main pages. */
export default function FooterSitemap() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const columns = [SHOP_LINKS, isAuthenticated ? ACCOUNT_LINKS : GUEST_LINKS, LEGAL_LINKS];

  return (
    <nav
      aria-label="Footer"
      className="mx-auto mt-6 grid w-fit grid-cols-[auto_auto] gap-x-12 gap-y-6 text-left font-inter text-base sm:grid-cols-[auto_auto_auto] sm:gap-x-12 md:mx-0"
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
