"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "./nav-config";

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-sidebar/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                "min-h-[56px]",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-ink-faint hover:text-ink-muted active:scale-95"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
