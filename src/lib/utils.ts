import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, currency = "USD"): string {
  // values are stored in cents (Stripe convention) where applicable; the
  // dashboard fixture/API already passes whole-dollar figures, so we format
  // the number as-is. Adjust per-call if a value is in cents.
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
}

export function formatNumber(num: number | string): string {
  if (typeof num === "string") return num;
  return new Intl.NumberFormat("en-US").format(num);
}
