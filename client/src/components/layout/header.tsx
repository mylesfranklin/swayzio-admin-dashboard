import { Button } from "@/components/ui/button";
import { Bell, Plus, PanelLeftClose, PanelLeft, Command, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen = true }) => {
  const [location, navigate] = useLocation();

  const getPageTitle = () => {
    if (location === "/") return "Dashboard";
    if (location === "/customers") return "Customers";
    if (location.startsWith("/customers/")) return "Customer Details";
    if (location === "/socials") return "Social Media";
    if (location === "/seo") return "SEO Analytics";
    if (location === "/integrations") return "Integrations";
    if (location === "/integrations/hubspot") return "HubSpot";
    if (location === "/integrations/stripe") return "Stripe";
    if (location === "/integrations/kit") return "Kit Newsletter";
    if (location === "/sync-status") return "Sync Status";
    if (location === "/settings") return "Settings";
    return "Swayzio";
  };

  const getBreadcrumbs = () => {
    const parts = location.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    
    return (
      <nav className="flex items-center gap-1.5 text-xs" aria-label="Breadcrumb">
        <button 
          className="text-linear-text-secondary hover:text-white transition-colors duration-150" 
          onClick={() => navigate("/")}
        >
          Home
        </button>
        {parts.map((part, index) => (
          <span key={index} className="flex items-center gap-1.5">
            <span className="text-linear-text-tertiary">/</span>
            <span className={
              index === parts.length - 1 
                ? "text-white font-medium" 
                : "text-linear-text-secondary hover:text-white transition-colors duration-150 cursor-pointer"
            }>
              {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')}
            </span>
          </span>
        ))}
      </nav>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-linear-base/95 backdrop-blur-md border-b border-linear-border/50 h-14 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon-sm"
          className="hidden md:flex text-linear-text-secondary hover:text-white hover:bg-linear-hover"
          data-testid="button-toggle-sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="hidden md:flex items-center">
          {getBreadcrumbs()}
        </div>

        <h1 className="md:hidden text-base font-semibold text-white">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex items-center gap-2 text-linear-text-secondary hover:text-white hover:bg-linear-hover h-9 px-3"
          data-testid="button-command-palette"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="text-xs">Quick actions</span>
          <kbd className="ml-1 text-[10px] bg-linear-border/80 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="text-linear-text-secondary hover:text-white hover:bg-linear-hover relative"
            data-testid="button-notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-linear-error rounded-full animate-pulse" />
          </Button>
        </div>
        
        <Button 
          size="sm" 
          className="hidden md:inline-flex gap-1.5"
          data-testid="button-new-customer"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>
    </header>
  );
};

export default Header;
