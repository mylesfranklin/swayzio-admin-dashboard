import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useState } from "react";

// Components
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

// Pages
import Dashboard from "@/pages/dashboard";
import CustomersList from "@/pages/customers/index";
import CustomerDetails from "@/pages/customers/[id]";
import HubSpotIntegration from "@/pages/integrations/hubspot";
import StripeIntegration from "@/pages/integrations/stripe";
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
      <Route path="/integrations/hubspot" component={HubSpotIntegration} />
      <Route path="/integrations/stripe" component={StripeIntegration} />
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
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <Router />
          </main>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
