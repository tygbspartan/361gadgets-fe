import { Icon } from "@iconify/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  buttonText?: string;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  buttonText,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className ?? "py-2.5 lg:py-10"}`}>
      <Icon icon={icon} className="text-black w-6 h-6 lg:w-8.75 lg:h-8.75" />

      <p className="mt-2.5 font-inter font-semibold text-[14px] lg:text-[20px] leading-none text-black">
        {title}
      </p>

      <p className="mt-2.5 max-w-57.5 lg:max-w-72 font-inter font-normal text-[12px] lg:text-[16px] leading-none text-center text-[#747373]">
        {description}
      </p>

      {buttonText && (
        <Link
          href={ROUTES.PRODUCTS}
          className="mt-5 inline-flex items-center gap-2 bg-black text-white font-inter font-medium text-[14px] leading-none px-6 py-2.5 rounded-[3px] hover:opacity-80 transition-opacity"
        >
          {buttonText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
