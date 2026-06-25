import type { Metadata } from "next";
import { Poppins, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import { BRAND } from "@/config/brand";

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

export const metadata: Metadata = {
  title: "Daily Dose - Pharmaceutical & Personal Care",
  description:
    "Your one-stop shop for pharmaceutical and personal care products",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ "--color-primary": BRAND.primaryColor, "--color-ring": BRAND.primaryColor } as React.CSSProperties}>
      <body className={`${poppins.className} ${inter.variable} ${montserrat.variable}`}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
