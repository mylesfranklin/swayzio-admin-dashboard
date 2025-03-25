import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileCog,
  CreditCard,
  Activity,
  Settings,
  Share2,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [location] = useLocation();

  const navSections: NavSection[] = [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
        },
        {
          title: "Customers",
          href: "/customers",
          icon: <Users className="mr-3 h-5 w-5" />,
        },
        {
          title: "Socials",
          href: "/socials",
          icon: <Share2 className="mr-3 h-5 w-5" />,
        },
      ],
    },
    {
      title: "Integrations",
      items: [
        {
          title: "HubSpot",
          href: "/integrations/hubspot",
          icon: <FileCog className="mr-3 h-5 w-5" />,
        },
        {
          title: "Stripe",
          href: "/integrations/stripe",
          icon: <CreditCard className="mr-3 h-5 w-5" />,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "Sync Status",
          href: "/sync-status",
          icon: <Activity className="mr-3 h-5 w-5" />,
        },
        {
          title: "Settings",
          href: "/settings",
          icon: <Settings className="mr-3 h-5 w-5" />,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <aside className={cn(
      "bg-sidebar w-64 border-r border-gray-200 hidden md:block overflow-y-auto transition-all duration-300 ease-in-out",
      !isOpen && "md:w-0 md:overflow-hidden"
    )}>
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-primary-500"
          >
            <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
            <circle cx="14" cy="15" r="3"></circle>
            <path d="M21 15h-3"></path>
          </svg>
          <h1 className="text-xl font-bold text-white">Swayzio</h1>
        </div>
      </div>

      <nav className="mt-4 px-2">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-4 py-2">
              <h2 className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">
                {section.title}
              </h2>
            </div>

            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm rounded-md mb-1 group",
                  isActive(item.href)
                    ? "bg-sidebar-active text-sidebar-text-active"
                    : "text-sidebar-text hover:bg-sidebar-hover"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-sidebar-hover">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            JS
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Jane Smith</p>
            <p className="text-xs text-sidebar-text">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
