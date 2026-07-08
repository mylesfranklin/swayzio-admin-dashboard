"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import MobileNav from "./mobile-nav";
import { cn } from "@/lib/utils";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen overflow-hidden bg-base-100">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-200",
          isSidebarOpen ? "md:ml-[15.25rem]" : "md:ml-0"
        )}
      >
        <Header
          toggleSidebar={() => setIsSidebarOpen((v) => !v)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto bg-base-100 p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
