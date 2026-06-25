import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoadingProvider from "@/components/providers/LoadingProvider";
import { FlyProvider } from "@/components/providers/FlyProvider";
import { ToastProvider } from "@/components/ui/ToastStack";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <FlyProvider>
        <LoadingProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-12.5">{children}</main>
            <Footer />
          </div>
        </LoadingProvider>
      </FlyProvider>
    </ToastProvider>
  );
}
