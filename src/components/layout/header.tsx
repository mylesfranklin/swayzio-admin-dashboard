"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus, PanelLeftClose, PanelLeft, Command } from "lucide-react";

export default function Header({
  toggleSidebar,
  isSidebarOpen,
}: {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const title =
    pathname === "/"
      ? "Dashboard"
      : parts[parts.length - 1]
          ?.replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Swayzio";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line/50 bg-base-100/95 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="hidden rounded-md p-2 text-ink-muted transition-colors hover:bg-base-300 hover:text-ink md:flex"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden items-center gap-1.5 text-xs md:flex" aria-label="Breadcrumb">
          <Link href="/" className="text-ink-muted transition-colors hover:text-ink">
            Home
          </Link>
          {parts.map((part, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-ink-faint">/</span>
              <span
                className={
                  i === parts.length - 1
                    ? "font-medium text-ink"
                    : "text-ink-muted transition-colors hover:text-ink"
                }
              >
                {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ")}
              </span>
            </span>
          ))}
        </nav>

        <h1 className="text-base font-semibold text-ink md:hidden">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden h-9 items-center gap-2 rounded-md px-3 text-ink-muted transition-colors hover:bg-base-300 hover:text-ink lg:flex">
          <Command className="h-3.5 w-3.5" />
          <span className="text-xs">Quick actions</span>
          <kbd className="ml-1 rounded bg-line/80 px-1.5 py-0.5 font-mono text-[0.625rem]">⌘K</kbd>
        </button>

        <button
          aria-label="Notifications"
          className="relative rounded-md p-2 text-ink-muted transition-colors hover:bg-base-300 hover:text-ink"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-error" />
        </button>

        <button className="hidden h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-content transition-colors hover:bg-brand-hover md:inline-flex">
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>
    </header>
  );
}
