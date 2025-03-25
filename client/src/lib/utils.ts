import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatDate(date: string | number | Date): string {
  if (!date) return "N/A";
  
  let dateObj: Date;
  if (typeof date === "number") {
    // Unix timestamp
    dateObj = new Date(date * 1000);
  } else {
    // ISO string or Date object
    dateObj = new Date(date);
  }
  
  return format(dateObj, "MMM d, yyyy");
}

export function formatDateTime(date: string | number | Date): string {
  if (!date) return "N/A";
  
  let dateObj: Date;
  if (typeof date === "number") {
    // Unix timestamp
    dateObj = new Date(date * 1000);
  } else {
    // ISO string or Date object
    dateObj = new Date(date);
  }
  
  return format(dateObj, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: string | number | Date): string {
  if (!date) return "N/A";
  
  let dateObj: Date;
  if (typeof date === "number") {
    // Unix timestamp
    dateObj = new Date(date * 1000);
  } else {
    // ISO string or Date object
    dateObj = new Date(date);
  }
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
} {
  const statusMap: Record<string, { bg: string; text: string }> = {
    // Customer lifecycle stages
    "subscriber": { bg: "bg-blue-100", text: "text-blue-800" },
    "lead": { bg: "bg-purple-100", text: "text-purple-800" },
    "marketingqualifiedlead": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "salesqualifiedlead": { bg: "bg-sky-100", text: "text-sky-800" },
    "opportunity": { bg: "bg-amber-100", text: "text-amber-800" },
    "customer": { bg: "bg-green-100", text: "text-green-800" },
    "evangelist": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "other": { bg: "bg-gray-100", text: "text-gray-800" },
    
    // Lead statuses
    "new": { bg: "bg-blue-100", text: "text-blue-800" },
    "open": { bg: "bg-sky-100", text: "text-sky-800" },
    "in progress": { bg: "bg-amber-100", text: "text-amber-800" },
    "open deal": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "unqualified": { bg: "bg-red-100", text: "text-red-800" },
    "attempted to contact": { bg: "bg-purple-100", text: "text-purple-800" },
    "contact_connected": { bg: "bg-cyan-100", text: "text-cyan-800" },
    "bad timing": { bg: "bg-gray-100", text: "text-gray-800" },
    
    // Subscription statuses
    "active": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "canceled": { bg: "bg-gray-100", text: "text-gray-800" },
    "past_due": { bg: "bg-amber-100", text: "text-amber-800" },
    "trialing": { bg: "bg-blue-100", text: "text-blue-800" },
    "incomplete": { bg: "bg-red-100", text: "text-red-800" },
    
    // Payment statuses
    "paid": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "unpaid": { bg: "bg-red-100", text: "text-red-800" },
    "pending": { bg: "bg-amber-100", text: "text-amber-800" },
    
    // Integration statuses
    "connected": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "not_connected": { bg: "bg-red-100", text: "text-red-800" },
    "synced": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "not_synced": { bg: "bg-red-100", text: "text-red-800" },
    
    // Sync statuses
    "success": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "error": { bg: "bg-red-100", text: "text-red-800" },
    "partial": { bg: "bg-amber-100", text: "text-amber-800" },
    
    // Activity types
    "email": { bg: "bg-sky-100", text: "text-sky-800" },
    "meeting": { bg: "bg-violet-100", text: "text-violet-800" },
    "task": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "note": { bg: "bg-amber-100", text: "text-amber-800" },
    "call": { bg: "bg-blue-100", text: "text-blue-800" },
  };
  
  // Case-insensitive lookup with fallback
  const normalizedStatus = status.toLowerCase().replace(/[\s_-]/g, "");
  for (const [key, value] of Object.entries(statusMap)) {
    if (key.toLowerCase().replace(/[\s_-]/g, "") === normalizedStatus) {
      return value;
    }
  }
  
  return { bg: "bg-gray-100", text: "text-gray-800" };
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function getInitials(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return "??";
  return `${firstName ? firstName[0] : ""}${lastName ? lastName[0] : ""}`.toUpperCase();
}
