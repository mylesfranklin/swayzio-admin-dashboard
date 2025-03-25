import { cn, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bg, text } = getStatusColor(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        `rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text} border-transparent whitespace-nowrap`,
        className
      )}
    >
      {status}
    </Badge>
  );
}
