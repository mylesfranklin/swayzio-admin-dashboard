/**
 * Readability helpers for tool output. The Neon HTTP driver returns numeric/bigint as strings;
 * these coerce + format them so the agent always receives clean numbers and a unit-clear `summary`.
 */
export const num = (n: unknown): number | null =>
  n === null || n === undefined || n === "" ? null : Number(n);

export const usd = (n: unknown): string => {
  const v = num(n);
  return v === null ? "—" : `$${Math.round(v).toLocaleString("en-US")}`;
};

export const pct = (n: unknown, dp = 1): string => {
  const v = num(n);
  return v === null ? "—" : `${v.toFixed(dp)}%`;
};

export const int = (n: unknown): string => {
  const v = num(n);
  return v === null ? "—" : Math.round(v).toLocaleString("en-US");
};

/**
 * Coerce a row to clean, JSON-serializable values: plain-number strings → numbers,
 * Date → ISO string, and any other non-plain object (e.g. the driver's parsed
 * `interval`) → its string form. eve 0.19 hard-rejects non-JSON tool outputs, and the
 * Neon driver parses date/timestamptz/interval columns into objects.
 */
export function coerceNumbers<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v)) out[k] = Number(v);
    else if (v instanceof Date) out[k] = v.toISOString();
    else if (v !== null && typeof v === "object" && !Array.isArray(v)) out[k] = String(v);
    else out[k] = v;
  }
  return out as T;
}
