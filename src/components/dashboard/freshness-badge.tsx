import { cn } from "@/lib/utils";

export function FreshnessBadge({
  label,
  updatedAt,
  stale,
}: {
  label: string;
  updatedAt: string | null;
  stale: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-200 px-2 py-0.5 text-[0.6875rem] text-ink-faint">
      <span className={cn("h-1.5 w-1.5 rounded-full", stale ? "bg-warning" : "bg-success")} />
      {label}
      {updatedAt ? ` · ${new Date(updatedAt).toLocaleString()}` : " · not synced"}
    </span>
  );
}
