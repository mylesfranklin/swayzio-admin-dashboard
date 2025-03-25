import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { CustomerDetails } from "@/components/customers/customer-details";
import { apiRequest } from "@/lib/queryClient";

const CustomerDetailsPage: React.FC = () => {
  const params = useParams();
  const customerId = params.id;

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ["/api/customers", customerId],
    enabled: !!customerId,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">Error loading customer</h3>
          <p className="mt-2 text-sm text-gray-500">
            There was an error loading the customer details. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return <CustomerDetails customer={customer} isLoading={isLoading} />;
};

export default CustomerDetailsPage;
