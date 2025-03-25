import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge-custom";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  lastSynced?: string;
  apiKey?: string;
  onConnect: (apiKey: string) => void;
  onDisconnect: () => void;
  onUpdate: (apiKey: string) => void;
}

export function IntegrationCard({
  title,
  description,
  icon,
  isConnected,
  lastSynced,
  apiKey = "",
  onConnect,
  onDisconnect,
  onUpdate,
}: IntegrationCardProps) {
  const [newApiKey, setNewApiKey] = React.useState(apiKey);
  const [showApiKey, setShowApiKey] = React.useState(false);

  const handleConnect = () => {
    if (newApiKey.trim()) {
      onConnect(newApiKey);
    }
  };

  const handleUpdate = () => {
    if (newApiKey.trim()) {
      onUpdate(newApiKey);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{icon}</div>
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <StatusBadge 
            status={isConnected ? "Connected" : "Not Connected"} 
            className={isConnected ? "bg-emerald-100 text-emerald-800" : ""} 
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {isConnected ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm font-medium">
                API Key
              </Label>
              <div className="flex">
                <Input
                  id="api-key"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  type={showApiKey ? "text" : "password"}
                  className="flex-1"
                  placeholder={`Enter ${title} API Key`}
                />
                <Button
                  variant="outline"
                  type="button"
                  className="ml-2 whitespace-nowrap"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-sync" className="text-sm font-medium">
                  Enable Webhook Sync
                </Label>
                <Switch id="webhook-sync" defaultChecked={true} />
              </div>
              <p className="text-sm text-gray-500">
                Receive real-time updates when changes occur in {title}.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sync" className="text-sm font-medium">
                  Automatic Sync
                </Label>
                <Switch id="auto-sync" defaultChecked={true} />
              </div>
              <p className="text-sm text-gray-500">
                Automatically sync data every 30 minutes.
              </p>
            </div>
            
            {lastSynced && (
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  Last synced: {lastSynced}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                Connect your {title} account to sync customer data and enable integrated workflows.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="new-api-key" className="text-sm font-medium">
                API Key
              </Label>
              <div className="flex">
                <Input
                  id="new-api-key"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  type={showApiKey ? "text" : "password"}
                  className="flex-1"
                  placeholder={`Enter ${title} API Key`}
                />
                <Button
                  variant="outline"
                  type="button"
                  className="ml-2 whitespace-nowrap"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between py-4">
        {isConnected ? (
          <>
            <Button variant="ghost" onClick={handleDisconnect}>
              Disconnect
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">Test Connection</Button>
              <Button onClick={handleUpdate}>Update Settings</Button>
            </div>
          </>
        ) : (
          <>
            <div></div>
            <Button onClick={handleConnect} disabled={!newApiKey.trim()}>
              Connect
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
