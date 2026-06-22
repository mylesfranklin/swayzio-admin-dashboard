"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { cn, formatNumber } from "@/lib/utils";
import type { PowerUser } from "@/server/integrations/hubspot";

type SubFilter = "all" | "subscribed" | "unsubscribed";
type SortKey = "tracks" | "lastActivity";
const PAGE_SIZE = 25;
const SUB_FILTERS: Array<{ key: SubFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "subscribed", label: "Subscribed" },
  { key: "unsubscribed", label: "Unsubscribed" },
];

export function PowerUsersTable({ users }: { users: PowerUser[] }) {
  const [sub, setSub] = useState<SubFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("tracks");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const base =
      sub === "subscribed" ? users.filter((u) => u.subscribed)
      : sub === "unsubscribed" ? users.filter((u) => !u.subscribed)
      : users;
    const val = (u: PowerUser) => (sortKey === "tracks" ? u.tracks : u.lastActivity ? Date.parse(u.lastActivity) : 0);
    const sorted = [...base].sort((a, b) => (sortDir === "asc" ? val(a) - val(b) : val(b) - val(a)));
    return sorted;
  }, [users, sub, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const allEmails = filtered.map((u) => u.email).filter(Boolean).join(", ");

  function applySub(s: SubFilter) {
    setSub(s);
    setPage(0);
  }
  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th className="px-4 py-2 font-medium">
      <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 transition-colors hover:text-ink-muted">
        {children}
        {sortKey === k && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );

  return (
    <div className="rounded-box border border-line bg-base-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <div>
          <h3 className="text-sm font-medium text-ink">Power Users</h3>
          <p className="text-xs text-ink-faint">top {users.length} artists by catalog · {filtered.length} shown</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-line bg-base-200 p-0.5">
            {SUB_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => applySub(f.key)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  sub === f.key ? "bg-base-300 text-ink" : "text-ink-faint hover:text-ink-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <CopyButton label={`Copy ${filtered.length} emails`} value={allEmails} title="Copy emails for the current filter" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-2 font-medium">Artist</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <SortHeader k="tracks">Tracks</SortHeader>
              <th className="px-4 py-2 font-medium">PRO</th>
              <th className="px-4 py-2 font-medium">Subscribed</th>
              <SortHeader k="lastActivity">Last activity</SortHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                <td className="max-w-[180px] truncate px-4 py-2 font-medium text-ink">{u.name}</td>
                <td className="px-4 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="max-w-[200px] truncate text-ink-muted">{u.email || "—"}</span>
                    {u.email && <CopyButton value={u.email} />}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium text-ink">{formatNumber(u.tracks)}</td>
                <td className="px-4 py-2 text-ink-muted">{u.pro ?? "—"}</td>
                <td className="px-4 py-2">{u.subscribed ? <Badge tone="success">Yes</Badge> : <Badge tone="error">No</Badge>}</td>
                <td className="px-4 py-2 text-ink-muted">{u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-faint">No users match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line p-3 text-xs text-ink-faint">
        <span>{filtered.length === 0 ? "0 of 0" : `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}`}</span>
        <div className="flex items-center gap-2">
          <span>Page {safePage + 1} of {pageCount}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="rounded-md border border-line p-1 transition-colors hover:bg-base-300 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="rounded-md border border-line p-1 transition-colors hover:bg-base-300 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
