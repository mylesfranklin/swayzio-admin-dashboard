"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight, Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections } from "./nav-config";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    General: true,
    Socials: true,
    Administration: true,
  });

  const toggle = (title: string) =>
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-full w-[244px] flex-col border-r border-line bg-sidebar transition-all duration-300 ease-out md:flex",
        !isOpen && "md:w-0 md:overflow-hidden md:border-r-0"
      )}
    >
      {/* Workspace switcher */}
      <div className="flex items-center justify-between border-b border-line/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/70 shadow-glow-brand">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-ink">Swayzio</span>
            <p className="text-[10px] text-ink-faint">Admin Dashboard</p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 cursor-pointer text-ink-faint transition-colors hover:text-ink-muted" />
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <button className="group flex h-9 w-full items-center gap-2 rounded-lg border border-line bg-base-200 px-3 text-xs text-ink-muted transition-all duration-150 hover:bg-base-300 hover:text-ink">
          <Search className="h-3.5 w-3.5 text-ink-faint transition-colors group-hover:text-ink-muted" />
          <span className="flex-1 text-left">Search...</span>
          <span className="flex items-center gap-0.5 text-[10px] text-ink-faint">
            <Command className="h-3 w-3" /> K
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-1">
        {navSections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggle(section.title)}
              className="flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint transition-colors duration-150 hover:text-ink-muted"
            >
              <span>{section.title}</span>
              <ChevronRight
                className={cn(
                  "h-3 w-3 transition-transform duration-200 ease-out",
                  expanded[section.title] && "rotate-90"
                )}
              />
            </button>

            <div
              className={cn(
                "mt-1 space-y-0.5 overflow-hidden transition-all duration-200 ease-out",
                expanded[section.title] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {section.items.map((item, index) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ animationDelay: `${index * 30}ms` }}
                    className={cn(
                      "nav-item flex animate-[fadeInUp_0.3s_ease-out_forwards] items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
                      active
                        ? "active bg-brand/10 text-ink"
                        : "text-ink-muted hover:bg-base-300 hover:text-ink"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active && "text-brand")} />
                    <span className="flex-1 text-[13px]">{item.title}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-line/50 p-3">
        <div className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-base-300">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-info">
              <span className="text-xs font-medium text-white">JS</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">Jane Smith</p>
            <p className="text-[11px] text-ink-faint">Admin</p>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </aside>
  );
}
