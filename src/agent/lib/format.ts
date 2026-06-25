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

/** Coerce any plain-number string in a row to an actual number (dates/emails are left alone). */
export function coerceNumbers<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
  }
  return out as T;
}
