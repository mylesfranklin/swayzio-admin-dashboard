import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

const StripeIntegration: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/integrations/stripe"],
  });

  const connectMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return await apiRequest("POST", "/api/integrations/stripe/connect", { apiKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/stripe"] });
      toast({
        title: "Stripe Connected",
        description: "Your Stripe account has been successfully connected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Stripe. Please check your API key and try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return await apiRequest("PATCH", "/api/integrations/stripe/update", { apiKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/stripe"] });
      toast({
        title: "Settings Updated",
        description: "Your Stripe integration settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update Stripe settings.",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/integrations/stripe/disconnect", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/stripe"] });
      toast({
        title: "Stripe Disconnected",
        description: "Your Stripe account has been disconnected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect from Stripe.",
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
        <h1 className="text-2xl font-bold text-white">Stripe Integration</h1>
        <p className="text-linear-text-secondary text-sm mt-1">
          Connect and configure your Stripe integration to sync payment and subscription data
        </p>
      </div>

      <IntegrationCard
        title="Stripe"
        description="Sync payment, subscription, and invoice data from Stripe."
        icon={<CreditCard className="h-8 w-8 text-primary-600" />}
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
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general integration settings with Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Account Information</h4>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{config?.accountId || "Not available"}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Base URL</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{config?.baseUrl || "https://api.stripe.com"}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Currency</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{config?.currency?.toUpperCase() || "USD"}</dd>
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
                      apiRequest("POST", "/api/integrations/stripe/sync", {})
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/integrations/stripe"] });
                          toast({
                            title: "Sync Started",
                            description: "Stripe data synchronization has started.",
                          });
                        })
                        .catch((error) => {
                          toast({
                            title: "Sync Failed",
                            description: error.message || "Failed to start Stripe sync.",
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
          
          <TabsContent value="webhooks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Configure webhooks to receive real-time updates from Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Webhook Endpoints</h4>
                  <div className="border rounded-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                      <h5 className="font-medium">Main Webhook</h5>
                    </div>
                    <div className="p-4">
                      <dl className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <dt className="text-sm font-medium text-gray-500">Webhook URL</dt>
                          <dd className="text-sm text-gray-900 col-span-2 break-all">
                            {`${window.location.origin}/api/webhooks/stripe`}
                          </dd>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <dt className="text-sm font-medium text-gray-500">Signing Secret</dt>
                          <dd className="text-sm text-gray-900 col-span-2">
                            {config?.webhookSecret ? "•••••••••••••••••••••" : "Not configured"}
                          </dd>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm text-gray-900 col-span-2">
                            {config?.webhookEnabled ? "Enabled" : "Not configured"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Events to Monitor</h4>
                  <div className="border rounded-md p-4">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                      <li className="flex items-center">
                        <span className="text-sm">customer.created</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">customer.updated</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">customer.deleted</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">invoice.created</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">invoice.paid</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">invoice.payment_failed</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">subscription.created</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">subscription.updated</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-sm">subscription.deleted</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product & Subscription Configuration</CardTitle>
                <CardDescription>
                  Configure product and subscription settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Active Products</h4>
                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-4 gap-4 p-4 font-medium bg-gray-50 border-b">
                        <div>Product</div>
                        <div>Price</div>
                        <div>Interval</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">Enterprise Plan</div>
                          <div className="text-sm">$399.00</div>
                          <div className="text-sm">Monthly</div>
                          <div className="text-sm">Active</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">Premium Plan</div>
                          <div className="text-sm">$199.00</div>
                          <div className="text-sm">Monthly</div>
                          <div className="text-sm">Active</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">Standard Plan</div>
                          <div className="text-sm">$99.00</div>
                          <div className="text-sm">Monthly</div>
                          <div className="text-sm">Active</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">Basic Plan</div>
                          <div className="text-sm">$49.00</div>
                          <div className="text-sm">Monthly</div>
                          <div className="text-sm">Active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Subscription Settings</h4>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Default Payment Method</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {config?.defaultPaymentMethod || "Credit Card"}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-sm font-medium text-gray-500">Trial Period</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {config?.trialPeriod || "14 days"}
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

export default StripeIntegration;
