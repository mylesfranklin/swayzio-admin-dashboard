import React from "react";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge-custom";
import { formatDate, getInitials } from "@/lib/utils";
import { Customer } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
}

export function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  const [_, navigate] = useLocation();

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">#{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const customer = row.original as Customer;
        const fullName = `${customer.firstName} ${customer.lastName}`;
        return (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-gray-200">
              <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-xs text-gray-500">{customer.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.getValue("company") || "—",
    },
    {
      accessorKey: "stage",
      header: "Lifecycle Stage",
      cell: ({ row }) => {
        const stage = row.getValue("stage") as string;
        return stage ? <StatusBadge status={stage} /> : "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return status ? <StatusBadge status={status} /> : "—";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.getValue("createdAt") as string),
    },
    {
      accessorKey: "integrationStatus",
      header: "Integration",
      cell: ({ row }) => {
        const customer = row.original as Customer;
        const hasHubspot = Boolean(customer.hubspotId);
        const hasStripe = Boolean(customer.stripeId);

        if (hasHubspot && hasStripe) {
          return <StatusBadge status="Connected" />;
        } else if (hasHubspot || hasStripe) {
          return <StatusBadge status="Partial" />;
        } else {
          return <StatusBadge status="Not Connected" />;
        }
      },
    },
  ];

  const handleRowClick = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  return (
    <DataTable
      columns={columns}
      data={customers}
      onRowClick={handleRowClick}
      searchableColumns={["name", "email", "company"]}
      placeholder="Search customers..."
    />
  );
}
