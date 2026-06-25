import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FlyProvider } from "@/components/providers/FlyProvider";
import LoadingProvider from "@/components/providers/LoadingProvider";
import { ToastProvider } from "@/components/ui/ToastStack";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <FlyProvider>
        <LoadingProvider>
          <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4 pb-12.5">
              {children}
            </main>
            <Footer />
          </div>
        </LoadingProvider>
      </FlyProvider>
    </ToastProvider>
  );
}
