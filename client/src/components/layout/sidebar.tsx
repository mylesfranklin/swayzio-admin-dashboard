import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  Settings,
  Share2,
  Search,
  ChevronDown,
  BarChart3,
  Mail,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

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
  defaultOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    General: true,
    Integrations: true,
    Administration: true,
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const navSections: NavSection[] = [
    {
      title: "General",
      defaultOpen: true,
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          title: "Customers",
          href: "/customers",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Social Media",
          href: "/socials",
          icon: <Share2 className="h-4 w-4" />,
        },
        {
          title: "SEO Analytics",
          href: "/seo",
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Integrations",
      defaultOpen: true,
      items: [
        {
          title: "HubSpot",
          href: "/integrations/hubspot",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          title: "Stripe",
          href: "/integrations/stripe",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: "Kit Newsletter",
          href: "/integrations/kit",
          icon: <Mail className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Administration",
      defaultOpen: true,
      items: [
        {
          title: "Sync Status",
          href: "/sync-status",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Settings",
          href: "/settings",
          icon: <Settings className="h-4 w-4" />,
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
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full w-sidebar bg-linear-sidebar border-r border-linear-border hidden md:flex flex-col transition-all duration-200 ease-out z-50",
        !isOpen && "md:w-0 md:overflow-hidden"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-linear-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-linear-purple flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-white font-semibold text-sm">Swayzio</span>
        </div>
        <ChevronDown className="h-4 w-4 text-linear-text-secondary" />
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-linear-text-tertiary" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-7 pl-7 pr-8 text-xs bg-linear-card border border-linear-border rounded text-white placeholder:text-linear-text-tertiary focus:outline-none focus:ring-1 focus:ring-linear-purple"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-linear-text-tertiary bg-linear-border px-1 rounded">/</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1" data-testid="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-medium text-linear-text-secondary uppercase tracking-wider hover:text-white transition-colors"
              data-testid={`section-toggle-${section.title.toLowerCase()}`}
            >
              <span>{section.title}</span>
              <ChevronRight 
                className={cn(
                  "h-3 w-3 transition-transform duration-150",
                  expandedSections[section.title] && "rotate-90"
                )} 
              />
            </button>

            {expandedSections[section.title] && (
              <div className="mt-0.5 space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors duration-150",
                      isActive(item.href)
                        ? "bg-linear-border text-white"
                        : "text-linear-text-secondary hover:bg-linear-hover hover:text-white"
                    )}
                    data-testid={`nav-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-linear-border p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-linear-purple flex items-center justify-center">
            <span className="text-white text-xs font-medium">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Jane Smith</p>
            <p className="text-xs text-linear-text-secondary">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
