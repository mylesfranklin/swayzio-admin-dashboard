import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Share2,
  Search,
  ChevronDown,
  BarChart3,
  ChevronRight,
  Command,
  Mail,
  Globe,
} from "lucide-react";
import { SiHubspot, SiStripe, SiGithub, SiVercel } from "react-icons/si";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
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
    Analytics: true,
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
          badge: "5.8K",
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
      title: "Analytics",
      defaultOpen: true,
      items: [
        {
          title: "HubSpot",
          href: "/analytics/hubspot",
          icon: <SiHubspot className="h-4 w-4" />,
        },
        {
          title: "Stripe",
          href: "/analytics/stripe",
          icon: <SiStripe className="h-4 w-4" />,
        },
        {
          title: "GitHub",
          href: "/analytics/github",
          icon: <SiGithub className="h-4 w-4" />,
        },
        {
          title: "Vercel",
          href: "/analytics/vercel",
          icon: <SiVercel className="h-4 w-4" />,
        },
        {
          title: "Kit Newsletter",
          href: "/analytics/kit",
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
        "fixed left-0 top-0 h-full w-sidebar bg-linear-sidebar border-r border-linear-border hidden md:flex flex-col transition-all duration-300 ease-out z-50",
        !isOpen && "md:w-0 md:overflow-hidden md:border-r-0"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-linear-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-linear-purple to-linear-purple/70 flex items-center justify-center shadow-glow-purple/50">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <div>
            <span className="text-white font-semibold text-sm">Swayzio</span>
            <p className="text-[10px] text-linear-text-tertiary">Admin Dashboard</p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-linear-text-tertiary hover:text-linear-text-secondary transition-colors cursor-pointer" />
      </div>

      <div className="px-3 py-3">
        <button 
          className="w-full flex items-center gap-2 h-9 px-3 text-xs bg-linear-card hover:bg-linear-hover border border-linear-border rounded-lg text-linear-text-secondary hover:text-white transition-all duration-150 group"
          data-testid="search-button"
        >
          <Search className="h-3.5 w-3.5 text-linear-text-tertiary group-hover:text-linear-text-secondary transition-colors" />
          <span className="flex-1 text-left">Search...</span>
          <div className="flex items-center gap-0.5 text-[10px] text-linear-text-tertiary">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-4" data-testid="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-medium text-linear-text-tertiary uppercase tracking-wider hover:text-linear-text-secondary transition-colors duration-150"
              data-testid={`section-toggle-${section.title.toLowerCase()}`}
            >
              <span>{section.title}</span>
              <ChevronRight 
                className={cn(
                  "h-3 w-3 transition-transform duration-200 ease-out",
                  expandedSections[section.title] && "rotate-90"
                )} 
              />
            </button>

            <div 
              className={cn(
                "mt-1 space-y-0.5 overflow-hidden transition-all duration-200 ease-out",
                expandedSections[section.title] 
                  ? "max-h-96 opacity-100" 
                  : "max-h-0 opacity-0"
              )}
            >
              {section.items.map((item, index) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "nav-item flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg transition-all duration-150",
                      active
                        ? "bg-linear-purple/10 text-white"
                        : "text-linear-text-secondary hover:bg-linear-hover hover:text-white",
                      "animate-fade-in-up"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    data-testid={`nav-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className={cn(
                      "transition-colors duration-150",
                      active ? "text-linear-purple" : ""
                    )}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-[13px]">{item.title}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-linear-border text-linear-text-secondary">
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-linear-purple" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-linear-border/50 p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-linear-hover transition-colors cursor-pointer group">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-linear-purple to-linear-info flex items-center justify-center">
              <span className="text-white text-xs font-medium">JS</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-linear-success border-2 border-linear-sidebar" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Jane Smith</p>
            <p className="text-[11px] text-linear-text-tertiary">Admin</p>
          </div>
          <ChevronRight className="h-4 w-4 text-linear-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
