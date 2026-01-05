import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Landmark,
} from "lucide-react";
import { SiStripe, SiInstagram } from "react-icons/si";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Stripe",
    href: "/analytics/stripe",
    icon: <SiStripe className="h-5 w-5" />,
  },
  {
    title: "Mercury",
    href: "/mercury",
    icon: <Landmark className="h-5 w-5" />,
  },
  {
    title: "Socials",
    href: "/socials/instagram",
    icon: <SiInstagram className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function MobileNav() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-linear-sidebar/95 backdrop-blur-xl border-t border-linear-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] touch-target rounded-xl transition-all duration-200",
                active
                  ? "text-linear-purple bg-linear-purple/10"
                  : "text-linear-text-tertiary hover:text-linear-text-secondary active:scale-95"
              )}
              data-testid={`mobile-nav-${item.title.toLowerCase()}`}
            >
              <div className={cn(
                "relative",
                active && "animate-scale-in"
              )}>
                {item.icon}
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-linear-purple" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
