import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/customers?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const isCustomersPage = location === "/customers" || location.startsWith("/customers/");

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center lg:hidden">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className="text-gray-500"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {isCustomersPage && (
        <form
          onSubmit={handleSearch}
          className="max-w-md w-full lg:max-w-xs relative"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-400"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <Input
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400"
            placeholder="Search customers..."
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      )}

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-gray-500"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <Button size="sm" className="hidden md:inline-flex">
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>
    </header>
  );
};

export default Header;
