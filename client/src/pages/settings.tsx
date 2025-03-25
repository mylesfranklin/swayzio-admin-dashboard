import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      return await apiRequest("PATCH", "/api/settings", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Form state for general settings
  const [generalSettings, setGeneralSettings] = useState({
    applicationName: "",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12h",
    timezone: "UTC",
    defaultCurrency: "USD"
  });
  
  // Form state for sync settings
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncFrequency: 30,
    conflictResolution: "hubspot"
  });
  
  // Form state for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    syncFailures: true,
    newCustomers: true,
    paymentFailures: true,
    subscriptionChanges: true,
    emailAddress: ""
  });

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setGeneralSettings({
        applicationName: settings.applicationName || "Swayzio Admin",
        dateFormat: settings.dateFormat || "MM/dd/yyyy",
        timeFormat: settings.timeFormat || "12h",
        timezone: settings.timezone || "UTC",
        defaultCurrency: settings.defaultCurrency || "USD"
      });
      
      setSyncSettings({
        autoSync: settings.autoSync !== undefined ? settings.autoSync : true,
        syncFrequency: settings.syncFrequency || 30,
        conflictResolution: settings.conflictResolution || "hubspot"
      });
      
      setNotificationSettings({
        emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
        syncFailures: settings.syncFailures !== undefined ? settings.syncFailures : true,
        newCustomers: settings.newCustomers !== undefined ? settings.newCustomers : true,
        paymentFailures: settings.paymentFailures !== undefined ? settings.paymentFailures : true,
        subscriptionChanges: settings.subscriptionChanges !== undefined ? settings.subscriptionChanges : true,
        emailAddress: settings.emailAddress || ""
      });
    }
  }, [settings]);

  const handleGeneralSettingsSave = () => {
    updateSettingsMutation.mutate(generalSettings);
  };
  
  const handleSyncSettingsSave = () => {
    updateSettingsMutation.mutate(syncSettings);
  };
  
  const handleNotificationSettingsSave = () => {
    updateSettingsMutation.mutate(notificationSettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-500 mt-1">
          Configure application settings and preferences
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application-name">Application Name</Label>
                    <Input 
                      id="application-name"
                      value={generalSettings.applicationName}
                      onChange={(e) => setGeneralSettings({...generalSettings, applicationName: e.target.value})}
                      placeholder="Swayzio Admin Dashboard"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select 
                      value={generalSettings.dateFormat}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}
                    >
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MMMM d, yyyy">Month D, YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select 
                      value={generalSettings.timeFormat}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timeFormat: value})}
                    >
                      <SelectTrigger id="time-format">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={generalSettings.timezone}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select 
                      value={generalSettings.defaultCurrency}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, defaultCurrency: value})}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="AUD">AUD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleGeneralSettingsSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>
                Configure how data synchronization works between systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-sync">Automatic Synchronization</Label>
                    <p className="text-sm text-gray-500">
                      Enable automatic synchronization between HubSpot and Stripe
                    </p>
                  </div>
                  <Switch 
                    id="auto-sync" 
                    checked={syncSettings.autoSync}
                    onCheckedChange={(checked) => setSyncSettings({...syncSettings, autoSync: checked})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <Select 
                      value={syncSettings.syncFrequency.toString()}
                      onValueChange={(value) => setSyncSettings({...syncSettings, syncFrequency: parseInt(value)})}
                    >
                      <SelectTrigger id="sync-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="conflict-resolution">Conflict Resolution Strategy</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Define which system should be considered the source of truth when conflicts occur
                  </p>
                  <Select 
                    value={syncSettings.conflictResolution}
                    onValueChange={(value) => setSyncSettings({...syncSettings, conflictResolution: value})}
                  >
                    <SelectTrigger id="conflict-resolution">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hubspot">HubSpot is primary</SelectItem>
                      <SelectItem value="stripe">Stripe is primary</SelectItem>
                      <SelectItem value="newest">Most recently updated wins</SelectItem>
                      <SelectItem value="manual">Manual resolution (require approval)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSyncSettingsSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                
                {notificationSettings.emailNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input 
                      id="email-address"
                      value={notificationSettings.emailAddress}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailAddress: e.target.value})}
                      placeholder="admin@example.com"
                    />
                  </div>
                )}
                
                <Separator />
                
                <h3 className="text-sm font-medium">Notification Events</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-failures" className="cursor-pointer">Synchronization Failures</Label>
                    <Switch 
                      id="sync-failures" 
                      checked={notificationSettings.syncFailures}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, syncFailures: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-customers" className="cursor-pointer">New Customers</Label>
                    <Switch 
                      id="new-customers" 
                      checked={notificationSettings.newCustomers}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newCustomers: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-failures" className="cursor-pointer">Payment Failures</Label>
                    <Switch 
                      id="payment-failures" 
                      checked={notificationSettings.paymentFailures}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentFailures: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscription-changes" className="cursor-pointer">Subscription Changes</Label>
                    <Switch 
                      id="subscription-changes" 
                      checked={notificationSettings.subscriptionChanges}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, subscriptionChanges: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNotificationSettingsSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users who have access to the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium bg-gray-50 border-b">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-4 gap-4 p-4 items-center">
                      <div className="text-sm font-medium">Jane Smith</div>
                      <div className="text-sm">jane.smith@example.com</div>
                      <div className="text-sm">Admin</div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Edit user</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 p-4 items-center">
                      <div className="text-sm font-medium">John Doe</div>
                      <div className="text-sm">john.doe@example.com</div>
                      <div className="text-sm">User</div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Edit user</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
