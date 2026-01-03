import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Menu, PanelLeftClose, PanelLeft, Command } from "lucide-react";
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
      <div className="flex items-center gap-1 text-xs text-linear-text-secondary">
        <span className="hover:text-white cursor-pointer" onClick={() => navigate("/")}>Home</span>
        {parts.map((part, index) => (
          <span key={index} className="flex items-center gap-1">
            <span className="text-linear-text-tertiary">›</span>
            <span className={index === parts.length - 1 ? "text-white" : "hover:text-white cursor-pointer"}>
              {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')}
            </span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <header className="bg-linear-base border-b border-linear-border h-12 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon-sm"
          className="text-linear-text-secondary hover:text-white"
          data-testid="button-toggle-sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="hidden md:flex items-center gap-2">
          {getBreadcrumbs()}
        </div>

        <h1 className="md:hidden text-sm font-semibold text-white">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center gap-2 text-linear-text-secondary hover:text-white"
          data-testid="button-command-palette"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="text-xs">Command</span>
          <span className="text-[10px] bg-linear-border px-1 rounded">⌘K</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="text-linear-text-secondary hover:text-white"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
        
        <Button 
          size="sm" 
          className="hidden md:inline-flex"
          data-testid="button-new-customer"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          New
        </Button>
      </div>
    </header>
  );
};

export default Header;
