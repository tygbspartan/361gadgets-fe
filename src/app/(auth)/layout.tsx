import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FlyProvider } from "@/components/providers/FlyProvider";
import { ToastProvider } from "@/components/ui/ToastStack";
import CursorFollower from "@/components/ui/CursorFollower";
import type { Metadata } from "next";
import { FORM_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = { robots: FORM_ROBOTS };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <FlyProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4 pb-12.5">
              {children}
            </main>
            <Footer />
          </div>
          <CursorFollower />
      </FlyProvider>
    </ToastProvider>
  );
}
