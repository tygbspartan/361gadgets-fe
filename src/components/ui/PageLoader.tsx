import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-6 animate-pulse">
          <h1 className="text-4xl font-bold text-black">
            Daily <span className="text-red-600">Dose</span>
          </h1>
        </div>

        {/* Spinner with pulse */}
        {/* <div className="flex justify-center mb-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
            <div className="absolute inset-0 bg-red-600 rounded-full opacity-20 animate-ping" />
          </div>
        </div> */}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="h-2 w-2 bg-red-600 rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="h-2 w-2 bg-red-600 rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="h-2 w-2 bg-red-600 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>

        <p className="text-gray-600 text-sm">
          Loading your health essentials...
        </p>
      </div>
    </div>
  );
}
