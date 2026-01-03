import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useState } from "react";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

import Dashboard from "@/pages/dashboard";
import CustomersList from "@/pages/customers/index";
import CustomerDetails from "@/pages/customers/[id]";
import StripeCheckoutPage from "@/pages/integrations/stripe-checkout";
import SyncStatus from "@/pages/sync-status";
import Settings from "@/pages/settings";
import SocialsPage from "@/pages/socials";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/customers" component={CustomersList} />
      <Route path="/customers/:id" component={CustomerDetails} />
      <Route path="/integrations/stripe-checkout" component={StripeCheckoutPage} />
      <Route path="/sync-status" component={SyncStatus} />
      <Route path="/socials" component={SocialsPage} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen overflow-hidden bg-linear-base">
        <Sidebar isOpen={isSidebarOpen} />
        <div 
          className="flex-1 flex flex-col overflow-hidden transition-all duration-200 md:ml-0"
          style={{ marginLeft: isSidebarOpen ? '244px' : '0' }}
        >
          <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 overflow-y-auto bg-linear-base p-4 md:p-6 pb-24 md:pb-6">
            <Router />
          </main>
        </div>
        <MobileNav />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
