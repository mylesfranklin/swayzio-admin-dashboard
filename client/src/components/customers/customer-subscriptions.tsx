import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge-custom";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Subscription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CustomerSubscriptionsProps {
  customerId: string;
  stripeId: string | null;
}

const CustomerSubscriptions: React.FC<CustomerSubscriptionsProps> = ({ customerId, stripeId }) => {
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ["/api/customers", customerId, "subscriptions"],
    enabled: !!stripeId,
  });

  if (!stripeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">
              No Stripe ID associated with this customer. Subscription data is not available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-destructive">Error loading subscriptions. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptions && subscriptions.length > 0 ? (
          <div className="space-y-6">
            {subscriptions.map((subscription: Subscription) => (
              <div key={subscription.id} className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-base font-medium">
                      {subscription.plan?.nickname || "Subscription"}
                    </h4>
                    <p className="text-sm text-gray-500">ID: {subscription.stripeId}</p>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">
                      {subscription.plan 
                        ? formatCurrency(subscription.plan.amount) 
                        : "N/A"}
                      {subscription.plan?.interval && (
                        <span className="text-gray-500 text-sm">
                          /{subscription.plan.interval}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{subscription.quantity}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Started On</p>
                    <p className="font-medium">{formatDate(subscription.created)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Current Period</p>
                    <p className="font-medium">
                      {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
                
                {subscription.cancelAtPeriodEnd && (
                  <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    This subscription is set to cancel at the end of the current billing period.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">No subscriptions found for this customer.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerSubscriptions;
