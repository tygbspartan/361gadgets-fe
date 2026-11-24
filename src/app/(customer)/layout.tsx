import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FlyProvider } from "@/components/providers/FlyProvider";
import { ToastProvider } from "@/components/ui/ToastStack";
import CursorFollower from "@/components/ui/CursorFollower";
import CompareTray from "@/components/compare/CompareTray";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <FlyProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-12.5">{children}</main>
            <Footer />
          </div>
          <CompareTray />
          <CursorFollower />
      </FlyProvider>
    </ToastProvider>
  );
}
