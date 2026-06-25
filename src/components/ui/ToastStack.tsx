"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Icon } from "@iconify/react";

export interface ToastPayload {
  icon: string;
  title: string;
  description?: string;
  variant: "positive" | "negative";
}

interface ToastItem extends ToastPayload {
  id: string;
}

interface ToastContextValue {
  showToast: (payload: ToastPayload) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((payload: ToastPayload) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...payload, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const isPositive = toast.variant === "positive";
  return (
    <div
      className={`w-84.5 rounded-xl border bg-white flex items-start gap-4 py-3.75 px-5 shadow-lg pointer-events-auto ${
        isPositive ? "border-[#1FA74C]" : "border-[#C01726]"
      }`}
    >
      <Icon
        icon={toast.icon}
        width={24}
        height={24}
        className={`shrink-0 mt-0.5 ${isPositive ? "text-[#1FA74C]" : "text-[#C01726]"}`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-montserrat font-semibold text-sm leading-[1.4] capitalize text-black">
          {toast.title}
        </p>
        {toast.description && (
          <p className="font-inter font-normal text-xs leading-[1.6] text-[#4B4B4B] mt-0.5">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-gray-400 hover:text-black transition-colors mt-0.5"
      >
        <Icon icon="material-symbols:close" width={14} height={14} />
      </button>
    </div>
  );
}
