import type { Metadata } from "next";
import { Poppins, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { BRAND } from "@/config/brand";
import { HERO_BOOT_SCRIPT, SCROLL_TOP_ON_RELOAD_SCRIPT } from "@/components/home/heroCircuit";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const SITE_TITLE = "361 Gadgets | Genuine Tech & Gadgets in Nepal";
const SITE_DESCRIPTION =
  "Shop genuine gadgets & tech online in Nepal — phones, accessories & more from trusted brands, delivered to your door.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.361gadgets.com"),
  title: {
    default: SITE_TITLE,
    // Per-page titles (e.g. a product name) render as "Name | 361 Gadgets".
    template: "%s | 361 Gadgets",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "gadgets Nepal",
    "buy gadgets online Nepal",
    "tech Nepal",
    "electronics Nepal",
    "361 Gadgets",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "361 Gadgets",
    url: "https://www.361gadgets.com",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* suppressHydrationWarning: HERO_BOOT_SCRIPT may add data-hero-booted to
       <html> before React hydrates. Applies to this element's attributes only. */
    <html lang="en" suppressHydrationWarning style={{ "--color-primary": BRAND.primaryColor, "--color-ring": BRAND.primaryColor } as React.CSSProperties}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCROLL_TOP_ON_RELOAD_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: HERO_BOOT_SCRIPT }} />
      </head>
      <body className={`${poppins.className} ${inter.variable} ${montserrat.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: BRAND.name,
              url: "https://www.361gadgets.com",
              logo: "https://www.361gadgets.com/logos/logoSecondaryBlack.png",
            }),
          }}
        />
        <ReduxProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
