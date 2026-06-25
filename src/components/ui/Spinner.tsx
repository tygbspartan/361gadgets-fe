import { Loader2 } from "lucide-react";

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className ?? "py-16"}`}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
