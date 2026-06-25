import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-NP")}`;
}

export function getStockStatus(
  quantity: number,
  threshold: number = 10
): "in_stock" | "low_stock" | "out_of_stock" {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= threshold) return "low_stock";
  return "in_stock";
}
