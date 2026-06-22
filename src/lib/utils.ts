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

/** Human-readable byte size (e.g. 333 MB, 1.2 GB). */
export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const v = bytes / Math.pow(1024, i);
  return `${v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}
