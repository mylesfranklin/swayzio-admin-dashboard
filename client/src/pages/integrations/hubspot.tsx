import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileCog } from "lucide-react";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

const HubSpotIntegration: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/integrations/hubspot"],
  });

  const connectMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return await apiRequest("POST", "/api/integrations/hubspot/connect", { apiKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/hubspot"] });
      toast({
        title: "HubSpot Connected",
        description: "Your HubSpot account has been successfully connected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to HubSpot. Please check your API key and try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return await apiRequest("PATCH", "/api/integrations/hubspot/update", { apiKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/hubspot"] });
      toast({
        title: "Settings Updated",
        description: "Your HubSpot integration settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update HubSpot settings.",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/integrations/hubspot/disconnect", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/hubspot"] });
      toast({
        title: "HubSpot Disconnected",
        description: "Your HubSpot account has been disconnected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect from HubSpot.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = (apiKey: string) => {
    connectMutation.mutate(apiKey);
  };

  const handleUpdate = (apiKey: string) => {
    updateMutation.mutate(apiKey);
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">HubSpot Integration</h2>
        <p className="text-gray-500 mt-1">
          Connect and configure your HubSpot integration to sync customer data
        </p>
      </div>

      <IntegrationCard
        title="HubSpot"
        description="Sync contacts, activities, and deal data from HubSpot CRM."
        icon={<FileCog className="h-8 w-8 text-primary-600" />}
        isConnected={config?.isConnected || false}
        lastSynced={config?.lastSynced ? formatDateTime(config.lastSynced) : undefined}
        apiKey={config?.apiKey || ""}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onUpdate={handleUpdate}
      />

      {config?.isConnected && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="fields">Field Mapping</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general integration settings with HubSpot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Portal Information</h4>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Portal ID</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{config?.portalId || "Not available"}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Base URL</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{config?.baseUrl || "https://api.hubapi.com"}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Sync Options</h4>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Auto Sync</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{config?.autoSync ? "Enabled" : "Disabled"}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{config?.syncFrequency || 30} minutes</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Last Synced</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {config?.lastSynced ? formatDateTime(config.lastSynced) : "Never"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      apiRequest("POST", "/api/integrations/hubspot/sync", {})
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/integrations/hubspot"] });
                          toast({
                            title: "Sync Started",
                            description: "HubSpot data synchronization has started.",
                          });
                        })
                        .catch((error) => {
                          toast({
                            title: "Sync Failed",
                            description: error.message || "Failed to start HubSpot sync.",
                            variant: "destructive",
                          });
                        });
                    }}
                  >
                    Sync Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fields" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Mapping</CardTitle>
                <CardDescription>
                  Configure how fields are mapped between HubSpot and the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-4 font-medium bg-gray-50 border-b">
                    <div>HubSpot Field</div>
                    <div>Internal Field</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="text-sm">firstname</div>
                      <div className="text-sm">firstName</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="text-sm">lastname</div>
                      <div className="text-sm">lastName</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="text-sm">email</div>
                      <div className="text-sm">email</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="text-sm">phone</div>
                      <div className="text-sm">phone</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="text-sm">company</div>
                      <div className="text-sm">company</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="text-sm">lifecyclestage</div>
                      <div className="text-sm">stage</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="text-sm">hs_lead_status</div>
                      <div className="text-sm">status</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced settings for the HubSpot integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Webhook Configuration</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Configure HubSpot webhooks to receive real-time updates when contacts are modified.
                    </p>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Webhook URL</dt>
                        <dd className="text-sm text-gray-900 col-span-2 break-all">
                          {`${window.location.origin}/api/webhooks/hubspot`}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {config?.webhookEnabled ? "Enabled" : "Disabled"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Data Conflict Resolution</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Configure how data conflicts between systems are resolved.
                    </p>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Strategy</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {config?.conflictStrategy || "HubSpot is primary"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default HubSpotIntegration;
