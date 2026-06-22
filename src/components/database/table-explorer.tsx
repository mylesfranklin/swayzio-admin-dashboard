"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn, formatNumber, formatBytes } from "@/lib/utils";
import type { TableStat } from "@/server/integrations/app-db-stats";

const DOMAIN_COLOR: Record<string, string> = {
  Catalog: "#3b5bdb", Intelligence: "#9b6bdb", Rights: "#59a200", Packs: "#2f80ed",
  Billing: "#f2c94c", Pipeline: "#5570ec", Events: "#eb5757", Libraries: "#2f9e8f",
  Tracking: "#6b6f76", Meta: "#545760", Other: "#545760",
};
type SortKey = "name" | "rows" | "totalBytes";

export function TableExplorer({ tables }: { tables: TableStat[] }) {
  const [key, setKey] = useState<SortKey>("totalBytes");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const maxBytes = Math.max(...tables.map((t) => t.totalBytes), 1);

  const sorted = [...tables].sort((a, b) => {
    const v = key === "name" ? a.name.localeCompare(b.name) : a[key] - b[key];
    return dir === "asc" ? v : -v;
  });
  const toggle = (k: SortKey) => {
    if (key === k) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setKey(k); setDir(k === "name" ? "asc" : "desc"); }
  };
  const SH = ({ k, children, className }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th className={cn("px-4 py-2 font-medium", className)}>
      <button type="button" onClick={() => toggle(k)} className="inline-flex items-center gap-1 transition-colors hover:text-ink-muted">
        {children}
        {key === k && (dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );

  return (
    <div className="rounded-box border border-line bg-base-200">
      <div className="border-b border-line p-4">
        <h3 className="text-sm font-medium text-ink">Table Explorer</h3>
        <p className="text-xs text-ink-faint">all {tables.length} tables · click a column to sort</p>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-base-200">
            <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
              <SH k="name">Table</SH>
              <th className="px-4 py-2 font-medium">Domain</th>
              <SH k="rows">Rows</SH>
              <SH k="totalBytes" className="min-w-[200px]">Size</SH>
              <th className="px-4 py-2 font-medium">Index</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.name} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                <td className="px-4 py-2 font-medium text-ink">{t.name}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className="size-2 rounded-full" style={{ backgroundColor: DOMAIN_COLOR[t.domain] || "#545760" }} />
                    {t.domain}
                  </span>
                </td>
                <td className="px-4 py-2 tabular-nums text-ink-muted">{formatNumber(t.rows)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-base-300">
                      <div className="h-full rounded-full bg-brand/60" style={{ width: `${Math.max((t.totalBytes / maxBytes) * 100, 1)}%` }} />
                    </div>
                    <span className="tabular-nums text-ink-muted">{formatBytes(t.totalBytes)}</span>
                  </div>
                </td>
                <td className="px-4 py-2 tabular-nums text-ink-faint">{formatBytes(t.indexBytes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
