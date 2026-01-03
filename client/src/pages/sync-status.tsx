import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SyncStatus, SyncEvent } from "@/components/integrations/sync-status";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SyncStatusPage: React.FC = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data: syncEvents, isLoading, refetch } = useQuery({
    queryKey: ["/api/sync-events", { filter }],
  });

  const handleManualSync = async () => {
    try {
      await apiRequest("POST", "/api/sync", { type: "full" });
      toast({
        title: "Sync Started",
        description: "A full synchronization has been started. This may take a few minutes.",
      });
      setTimeout(() => refetch(), 3000); // Refetch after a delay to show the new sync event
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to start synchronization.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sync Status</h1>
          <p className="mt-1 text-sm text-linear-text-secondary">
            Monitor and manage synchronization between HubSpot and Stripe
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Syncs</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="error">Failed</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleManualSync}>
            Start Full Sync
          </Button>
        </div>
      </div>
      
      <SyncStatus syncEvents={syncEvents || []} isLoading={isLoading} />
    </div>
  );
};

export default SyncStatusPage;
