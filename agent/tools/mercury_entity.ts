import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers } from "../lib/format.js";

const Entity = z.enum([
  "accounts",
  "recipients",
  "categories",
  "cards",
  "statements",
  "credit_accounts",
  "treasury_accounts",
  "treasury_transactions",
  "organization",
  "users",
  "events",
  "webhooks",
]);

async function readEntity(entity: z.infer<typeof Entity>, limit: number, includeRaw: boolean): Promise<Record<string, unknown>[]> {
  const sql = osSql();
  switch (entity) {
    case "accounts":
      return includeRaw
        ? ((await sql`SELECT * FROM api.mercury_accounts LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, name, status, type, kind, nickname, legal_business_name, available_balance,
                   current_balance, created_at, dashboard_link
            FROM api.mercury_accounts LIMIT ${limit}`) as Record<string, unknown>[]);
    case "recipients":
      return includeRaw
        ? ((await sql`SELECT * FROM api.mercury_recipients LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, status, name, default_payment_method, emails, default_address,
                   electronic_routing_info, attachments
            FROM api.mercury_recipients LIMIT ${limit}`) as Record<string, unknown>[]);
    case "categories":
      return (await sql`SELECT * FROM api.mercury_categories LIMIT ${limit}`) as Record<string, unknown>[];
    case "cards":
      return includeRaw
        ? ((await sql`SELECT * FROM api.mercury_cards LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT card_id, account_id, account_name, name_on_card, last_four_digits, network,
                   status, type, user_id, spend_limit, created_at, updated_at
            FROM api.mercury_cards LIMIT ${limit}`) as Record<string, unknown>[]);
    case "statements":
      return includeRaw
        ? ((await sql`SELECT * FROM api.mercury_statements LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT account_id, account_name, id, start_date, end_date, company_legal_name,
                   ending_balance, download_url, transactions
            FROM api.mercury_statements LIMIT ${limit}`) as Record<string, unknown>[]);
    case "credit_accounts":
      return (await sql`SELECT * FROM api.mercury_credit_accounts LIMIT ${limit}`) as Record<string, unknown>[];
    case "treasury_accounts":
      return (await sql`SELECT * FROM api.mercury_treasury_accounts LIMIT ${limit}`) as Record<string, unknown>[];
    case "treasury_transactions":
      return (await sql`SELECT * FROM api.mercury_treasury_transactions LIMIT ${limit}`) as Record<string, unknown>[];
    case "organization":
      return includeRaw
        ? ((await sql`SELECT * FROM api.mercury_organization LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, kind, ein, legal_business_name, dbas, subscription_tier, billing_cadence
            FROM api.mercury_organization LIMIT ${limit}`) as Record<string, unknown>[]);
    case "users":
      return includeRaw
        ? ((await sql`SELECT * FROM api.mercury_users LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT user_id, first_name, last_name, email, organization_role
            FROM api.mercury_users LIMIT ${limit}`) as Record<string, unknown>[]);
    case "events":
      return includeRaw
        ? ((await sql`SELECT * FROM api.mercury_events LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, resource_type, resource_id, operation_type, resource_version,
                   occurred_at, changed_paths, merge_patch
            FROM api.mercury_events LIMIT ${limit}`) as Record<string, unknown>[]);
    case "webhooks":
      return (await sql`SELECT * FROM api.mercury_webhooks LIMIT ${limit}`) as Record<string, unknown>[];
  }
}

export default defineTool({
  description:
    "Read any normalized Mercury OS entity: accounts, recipients, categories, cards, statements, credit, treasury, organization, users, events, or webhooks. Use includeRaw for full source payloads.",
  inputSchema: z.object({
    entity: Entity,
    limit: z.number().int().min(1).max(200).default(50),
    includeRaw: z.boolean().default(false),
  }),
  async execute({ entity, limit, includeRaw }) {
    const rows = await readEntity(entity, limit ?? 50, includeRaw ?? false);
    return {
      summary: `${rows.length} Mercury ${entity} row(s).${includeRaw ? " Raw source payloads included." : ""}`,
      entity,
      rows: rows.map(coerceNumbers),
    };
  },
});
