import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, usd } from "../lib/format.js";

export default defineTool({
  description:
    "Mercury transactions with account, amount, counterparty, category, card, merchant, memo, attachment metadata, and optional raw payloads.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(200).default(50),
    days: z.number().int().min(1).max(3650).optional(),
    accountId: z.string().optional(),
    includeRaw: z.boolean().default(false),
  }),
  async execute({ limit, days, accountId, includeRaw }) {
    const sql = osSql();
    const rows = includeRaw
      ? ((await sql`
          SELECT * FROM api.mercury_transactions
          WHERE (${days ?? null}::int IS NULL OR coalesce(posted_at, created_at) >= now() - make_interval(days => ${days ?? 0}))
            AND (${accountId ?? null}::text IS NULL OR account_id = ${accountId ?? null})
          ORDER BY coalesce(posted_at, created_at) DESC NULLS LAST
          LIMIT ${limit ?? 50}
        `) as Record<string, unknown>[])
      : ((await sql`
          SELECT id, account_id, amount, created_at, posted_at, status, note, bank_description,
                 external_memo, counterparty_id, counterparty_name, counterparty_nickname, kind,
                 mercury_category, category_id, category_name, general_ledger_code_name,
                 compliant_with_receipt_policy, has_generated_receipt, dashboard_link,
                 details, currency_exchange_info, gl_allocations, attachments, related_transactions, merchant
          FROM api.mercury_transactions
          WHERE (${days ?? null}::int IS NULL OR coalesce(posted_at, created_at) >= now() - make_interval(days => ${days ?? 0}))
            AND (${accountId ?? null}::text IS NULL OR account_id = ${accountId ?? null})
          ORDER BY coalesce(posted_at, created_at) DESC NULLS LAST
          LIMIT ${limit ?? 50}
        `) as Record<string, unknown>[]);
    const total = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
    return {
      summary: `${rows.length} Mercury transaction(s), net ${usd(total)} in the selected slice.`,
      transactions: rows.map(coerceNumbers),
    };
  },
});
