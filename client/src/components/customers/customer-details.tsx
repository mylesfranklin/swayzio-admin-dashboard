import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge-custom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, getInitials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerActivities from "@/components/customers/customer-activities";
import CustomerSubscriptions from "@/components/customers/customer-subscriptions";
import CustomerInvoices from "@/components/customers/customer-invoices";
import { 
  User, Phone, Mail, Building, MapPin, CalendarDays, Calendar,
  History, RefreshCw, Download, Bell
} from "lucide-react";

interface CustomerDetailsProps {
  customer: Customer | null;
  isLoading: boolean;
}

export function CustomerDetails({ customer, isLoading }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState("profile");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 mb-1" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4 mb-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Separator className="my-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-3" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full border-b border-gray-200 mb-6">
                {["Profile", "Activities", "Subscriptions", "Invoices"].map((tab) => (
                  <Skeleton key={tab} className="h-10 w-28 mx-2" />
                ))}
              </TabsList>
              <TabsContent value="profile">
                <Skeleton className="h-64 w-full" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Customer not found</h3>
          <p className="mt-2 text-sm text-gray-500">The customer you're looking for doesn't exist or you don't have access.</p>
        </div>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`;
  const initials = getInitials(customer.firstName, customer.lastName);
  const hasHubspot = Boolean(customer.hubspotId);
  const hasStripe = Boolean(customer.stripeId);
  
  let integrationStatus = "Not Connected";
  if (hasHubspot && hasStripe) {
    integrationStatus = "Connected";
  } else if (hasHubspot || hasStripe) {
    integrationStatus = "Partial";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customer Details</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Notify
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Profile</CardTitle>
            <StatusBadge 
              status={integrationStatus} 
              className={integrationStatus === "Connected" ? "bg-emerald-100 text-emerald-800" : ""}
            />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="h-20 w-20 text-lg">
                <AvatarFallback className="bg-primary-600 text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{fullName}</h3>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
              <div className="flex space-x-2">
                {customer.stage && <StatusBadge status={customer.stage} />}
                {customer.status && <StatusBadge status={customer.status} />}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              {customer.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm">{customer.email}</span>
              </div>
              
              {customer.company && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">{customer.company}</span>
                </div>
              )}
              
              {customer.address && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                  <span className="text-sm">
                    {[
                      customer.address.line1,
                      customer.address.line2,
                      customer.address.city,
                      customer.address.state,
                      customer.address.postalCode,
                      customer.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm">Created: {formatDate(customer.createdAt)}</span>
              </div>
              
              <div className="flex items-center">
                <History className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm">Modified: {formatDate(customer.lastModified)}</span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Integration Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <span className="text-xs text-gray-500 mb-1">HubSpot</span>
                  <StatusBadge status={hasHubspot ? "Connected" : "Not Connected"} />
                </div>
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <span className="text-xs text-gray-500 mb-1">Stripe</span>
                  <StatusBadge status={hasStripe ? "Connected" : "Not Connected"} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs Section */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b border-gray-200 mb-6">
              <TabsTrigger value="profile" className="px-4 py-2">Profile</TabsTrigger>
              <TabsTrigger value="activities" className="px-4 py-2">Activities</TabsTrigger>
              <TabsTrigger value="subscriptions" className="px-4 py-2">Subscriptions</TabsTrigger>
              <TabsTrigger value="invoices" className="px-4 py-2">Invoices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Details</h4>
                      <dl className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <dt className="text-sm font-medium text-gray-500">First Name</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{customer.firstName}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{customer.lastName}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{customer.email}</dd>
                        </div>
                        {customer.phone && (
                          <div className="grid grid-cols-3 gap-1">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="text-sm text-gray-900 col-span-2">{customer.phone}</dd>
                          </div>
                        )}
                        {customer.company && (
                          <div className="grid grid-cols-3 gap-1">
                            <dt className="text-sm font-medium text-gray-500">Company</dt>
                            <dd className="text-sm text-gray-900 col-span-2">{customer.company}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {customer.address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Address</h4>
                        <dl className="space-y-2">
                          {customer.address.line1 && (
                            <div className="grid grid-cols-3 gap-1">
                              <dt className="text-sm font-medium text-gray-500">Street</dt>
                              <dd className="text-sm text-gray-900 col-span-2">{customer.address.line1}</dd>
                            </div>
                          )}
                          {customer.address.line2 && (
                            <div className="grid grid-cols-3 gap-1">
                              <dt className="text-sm font-medium text-gray-500">Line 2</dt>
                              <dd className="text-sm text-gray-900 col-span-2">{customer.address.line2}</dd>
                            </div>
                          )}
                          {customer.address.city && (
                            <div className="grid grid-cols-3 gap-1">
                              <dt className="text-sm font-medium text-gray-500">City</dt>
                              <dd className="text-sm text-gray-900 col-span-2">{customer.address.city}</dd>
                            </div>
                          )}
                          {customer.address.state && (
                            <div className="grid grid-cols-3 gap-1">
                              <dt className="text-sm font-medium text-gray-500">State</dt>
                              <dd className="text-sm text-gray-900 col-span-2">{customer.address.state}</dd>
                            </div>
                          )}
                          {customer.address.postalCode && (
                            <div className="grid grid-cols-3 gap-1">
                              <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                              <dd className="text-sm text-gray-900 col-span-2">{customer.address.postalCode}</dd>
                            </div>
                          )}
                          {customer.address.country && (
                            <div className="grid grid-cols-3 gap-1">
                              <dt className="text-sm font-medium text-gray-500">Country</dt>
                              <dd className="text-sm text-gray-900 col-span-2">{customer.address.country}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}
                  </div>
                  
                  {customer.metadata && Object.keys(customer.metadata).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                        {Object.entries(customer.metadata).map(([key, value]) => (
                          // Skip internal or technical fields
                          !key.startsWith('_') && typeof value !== 'object' && (
                            <div key={key} className="overflow-hidden">
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                              </dt>
                              <dd className="text-sm text-gray-900 truncate">{String(value)}</dd>
                            </div>
                          )
                        ))}
                      </dl>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities">
              <CustomerActivities customerId={customer.id.toString()} hubspotId={customer.hubspotId} />
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <CustomerSubscriptions customerId={customer.id.toString()} stripeId={customer.stripeId} />
            </TabsContent>
            
            <TabsContent value="invoices">
              <CustomerInvoices customerId={customer.id.toString()} stripeId={customer.stripeId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
