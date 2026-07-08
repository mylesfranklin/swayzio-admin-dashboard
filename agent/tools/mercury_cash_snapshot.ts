import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, usd } from "../lib/format.js";

export default defineTool({
  description:
    "Mercury cash snapshot: account counts, available/current balances, treasury/credit balances, and transaction freshness.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.mercury_cash_snapshot`) as Record<string, unknown>[];
    const row = rows[0] ? coerceNumbers(rows[0]) : null;
    return {
      summary: row
        ? `Mercury available cash is ${usd(row.available_balance)}, current balance is ${usd(row.current_balance)}, across ${row.accounts} account(s).`
        : "No Mercury cash snapshot is available yet.",
      snapshot: row,
    };
  },
});
