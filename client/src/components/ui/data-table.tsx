import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  searchableColumns?: string[];
  className?: string;
  placeholder?: string;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  searchableColumns,
  className,
  placeholder = "Search...",
  pageSize = 10,
  isLoading = false,
  emptyMessage = "No results found.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const getSortIcon = (column: any) => {
    if (!column.getCanSort()) return null;
    if (!column.getIsSorted()) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-linear-text-tertiary" />;
    }
    if (column.getIsSorted() === 'asc') {
      return <ArrowUp className="ml-1 h-3 w-3 text-linear-purple" />;
    }
    return <ArrowDown className="ml-1 h-3 w-3 text-linear-purple" />;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {searchableColumns && searchableColumns.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-linear-text-tertiary" />
          <Input
            placeholder={placeholder}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-8 max-w-sm"
            data-testid="table-search-input"
          />
        </div>
      )}
      
      <div className="rounded-md border border-linear-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-linear-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="text-linear-text-secondary font-medium text-xs h-9 bg-linear-card"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center",
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {getSortIcon(header.column)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-linear-border">
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex} className="py-3">
                      <div className="h-4 bg-linear-hover rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-linear-border",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  data-testid={`table-row-${row.id}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-linear-border">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-linear-text-tertiary"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-linear-text-tertiary">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              data-testid="pagination-first"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              data-testid="pagination-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-linear-text-secondary">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              data-testid="pagination-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              data-testid="pagination-last"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const variantStyles = {
  success: 'bg-linear-success/20 text-linear-success border-linear-success/30',
  warning: 'bg-linear-warning/20 text-linear-warning border-linear-warning/30',
  error: 'bg-linear-error/20 text-linear-error border-linear-error/30',
  info: 'bg-linear-purple/20 text-linear-purple border-linear-purple/30',
  default: 'bg-linear-hover text-linear-text-secondary border-linear-border',
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs font-normal", variantStyles[variant])}
    >
      {status}
    </Badge>
  );
}

export function getStatusVariant(status: string): StatusBadgeProps['variant'] {
  const statusLower = status.toLowerCase();
  if (['active', 'success', 'completed', 'paid', 'open', 'merged'].includes(statusLower)) {
    return 'success';
  }
  if (['pending', 'in_progress', 'processing', 'draft'].includes(statusLower)) {
    return 'warning';
  }
  if (['failed', 'error', 'cancelled', 'closed', 'overdue'].includes(statusLower)) {
    return 'error';
  }
  if (['new', 'created', 'scheduled'].includes(statusLower)) {
    return 'info';
  }
  return 'default';
}
