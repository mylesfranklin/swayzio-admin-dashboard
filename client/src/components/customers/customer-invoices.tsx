import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge-custom";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Invoice } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Download } from "lucide-react";

interface CustomerInvoicesProps {
  customerId: string;
  stripeId: string | null;
}

const CustomerInvoices: React.FC<CustomerInvoicesProps> = ({ customerId, stripeId }) => {
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ["/api/customers", customerId, "invoices"],
    enabled: !!stripeId,
  });

  const columns = [
    {
      accessorKey: "number",
      header: "Invoice",
      cell: ({ row }) => {
        const invoice = row.original as Invoice;
        return (
          <div>
            <div className="font-medium">{invoice.number || `Invoice #${invoice.id}`}</div>
            <div className="text-xs text-gray-500">{invoice.invoiceId}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "created",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("created") as string),
    },
    {
      accessorKey: "amountDue",
      header: "Amount",
      cell: ({ row }) => {
        const invoice = row.original as Invoice;
        return formatCurrency(invoice.amountDue, invoice.currency);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original as Invoice;
        return (
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Download invoice</span>
            <Download className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  if (!stripeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">
              No Stripe ID associated with this customer. Invoice data is not available.
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
          <CardTitle className="text-lg font-medium">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-destructive">Error loading invoices. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices && invoices.length > 0 ? (
          <DataTable
            columns={columns}
            data={invoices}
            searchableColumns={["number"]}
            placeholder="Search invoices..."
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">No invoices found for this customer.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerInvoices;
