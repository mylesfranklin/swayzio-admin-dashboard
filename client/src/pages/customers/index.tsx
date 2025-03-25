import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CustomerTable } from "@/components/customers/customer-table";
import { Input } from "@/components/ui/input";
import { Download, Plus, RefreshCw, Filter } from "lucide-react";
import { Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const CustomersList: React.FC = () => {
  const [location] = useLocation();
  const [searchParams] = useState(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    return {
      search: params.get("search") || "",
    };
  });

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ["/api/customers", searchParams],
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // Handle exporting customers data
  };

  const handleAddCustomer = () => {
    // Handle adding a new customer
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customers and view their data across both HubSpot and Stripe
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleAddCustomer}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-md p-6">
        <CustomerTable customers={customers || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CustomersList;
