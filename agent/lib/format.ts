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
 * Coerce a row to clean, JSON-serializable values: plain-number strings -> numbers,
 * Date -> ISO string, arrays/plain JSON objects recursively preserved, and any other
 * non-plain object -> its string form. eve 0.19 hard-rejects non-JSON tool outputs,
 * while Neon JSONB columns arrive as plain objects that must remain inspectable.
 */
function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function coerceValue(value: unknown): unknown {
  if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(coerceValue);
  if (value !== null && typeof value === "object") {
    if (!isPlainObject(value)) return String(value);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, coerceValue(v)]));
  }
  return value;
}

export function coerceNumbers<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = coerceValue(v);
  }
  return out as T;
}
