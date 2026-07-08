/**
 * Mercury ELT feed -> Swayzio OS.
 *
 * Read-only API token only. Lands full source payloads in raw.records and normalizes the
 * high-value banking/finance surfaces into core.mercury_* tables for Eve and dashboard views.
 */
import { osSql } from "../db";
import { withSyncRun } from "../sync";
import { chunk, landRaw } from "../load";

type JsonRecord = Record<string, unknown>;
type Sql = ReturnType<typeof osSql>;

const BASE_URL = process.env.MERCURY_API_BASE_URL ?? "https://api.mercury.com/api/v1";

function token(): string {
  const value = process.env.MERCURY_API_TOKEN;
  if (!value) throw new Error("MERCURY_API_TOKEN is not set");
  return value;
}

function idOf(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

function text(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function bool(value: unknown): boolean | null {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value;
  return String(value) === "true";
}

function json(value: unknown, fallback: unknown = null): unknown {
  return value == null ? fallback : value;
}

function child<T = JsonRecord>(value: unknown, key: string): T | null {
  if (!value || typeof value !== "object") return null;
  const next = (value as JsonRecord)[key];
  return next && typeof next === "object" ? (next as T) : null;
}

function list<T = JsonRecord>(value: unknown, key: string): T[] {
  if (!value || typeof value !== "object") return [];
  const next = (value as JsonRecord)[key];
  return Array.isArray(next) ? (next as T[]) : [];
}

function endpoint(path: string): string {
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function mercuryGet<T>(path: string, options: { allow404?: boolean } = {}): Promise<T | null> {
  const res = await fetch(endpoint(path), {
    headers: { Authorization: `Bearer ${token()}`, accept: "application/json" },
  });
  const body = await res.text();
  if (res.status === 404 && options.allow404) return null;
  if (!res.ok) throw new Error(`Mercury ${path} failed ${res.status}: ${body.slice(0, 500)}`);
  return (body ? JSON.parse(body) : null) as T;
}

function addParams(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(path, "https://mercury.local");
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  return `${url.pathname}${url.search}`;
}

async function mercuryList<T extends JsonRecord>(
  path: string,
  key: string,
  options: { allow404?: boolean; limit?: number } = {},
): Promise<T[]> {
  const rows: T[] = [];
  let nextPage: string | undefined;
  const seen = new Set<string>();
  do {
    const pagePath = addParams(path, { limit: options.limit ?? 1000, ...(nextPage ? { start_after: nextPage } : {}) });
    const body = await mercuryGet<JsonRecord>(pagePath, { allow404: options.allow404 });
    if (!body) return rows;
    const batch = list<T>(body, key);
    rows.push(...batch);
    nextPage = text(child(body, "page")?.nextPage) ?? undefined;
    if (nextPage && seen.has(nextPage)) break;
    if (nextPage) seen.add(nextPage);
  } while (nextPage);
  return rows;
}

async function upsertJson(sql: Sql, query: ReturnType<Sql>, rows: JsonRecord[]): Promise<void> {
  if (rows.length === 0) return;
  await query;
}

async function syncRows(
  sql: Sql,
  sourceEntity: string,
  runId: number,
  rows: JsonRecord[],
  sourceId: (row: JsonRecord, index: number) => string,
  upsert: (batch: JsonRecord[]) => Promise<void>,
): Promise<number> {
  let written = 0;
  for (const batch of chunk(rows, 500)) {
    await landRaw(sql, "mercury", sourceEntity, runId, batch.map((row, i) => ({
      sourceId: sourceId(row, written + i),
      payload: row.raw && typeof row.raw === "object" ? row.raw : row,
    })));
    await upsert(batch);
    written += batch.length;
  }
  return written;
}

export async function syncMercuryOrganization() {
  return withSyncRun("mercury", "organization", async (ctx) => {
    const sql = osSql();
    const body = await mercuryGet<JsonRecord>("/organization");
    const org = child<JsonRecord>(body, "organization");
    const rows = org ? [org] : [];
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id) ?? "mercury-organization",
      kind: text(r.kind),
      ein: text(r.ein),
      legal_business_name: text(r.legalBusinessName),
      dbas: json(r.dbas, []),
      subscription_tier: text(r.subscriptionTier),
      billing_cadence: text(r.billingCadence),
      raw: r,
    }));
    const wrote = await syncRows(sql, "organization", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_organization
          (id, kind, ein, legal_business_name, dbas, subscription_tier, billing_cadence, raw)
        SELECT id, kind, ein, legal_business_name, coalesce(dbas, '[]'::jsonb), subscription_tier, billing_cadence, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, kind text, ein text, legal_business_name text, dbas jsonb, subscription_tier text, billing_cadence text, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          kind=EXCLUDED.kind, ein=EXCLUDED.ein, legal_business_name=EXCLUDED.legal_business_name,
          dbas=EXCLUDED.dbas, subscription_tier=EXCLUDED.subscription_tier,
          billing_cadence=EXCLUDED.billing_cadence, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryAccounts() {
  return withSyncRun("mercury", "account", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/accounts", "accounts");
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id),
      account_number: text(r.accountNumber),
      routing_number: text(r.routingNumber),
      name: text(r.name),
      status: text(r.status),
      type: text(r.type),
      kind: text(r.kind),
      nickname: text(r.nickname),
      legal_business_name: text(r.legalBusinessName),
      available_balance: num(r.availableBalance),
      current_balance: num(r.currentBalance),
      created_at: text(r.createdAt),
      dashboard_link: text(r.dashboardLink),
      raw: r,
    })).filter((r) => r.id);
    const wrote = await syncRows(sql, "account", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_account
          (id, account_number, routing_number, name, status, type, kind, nickname, legal_business_name,
           available_balance, current_balance, created_at, dashboard_link, raw)
        SELECT id, account_number, routing_number, name, status, type, kind, nickname, legal_business_name,
               available_balance, current_balance, created_at, dashboard_link, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, account_number text, routing_number text, name text, status text, type text, kind text,
               nickname text, legal_business_name text, available_balance numeric, current_balance numeric,
               created_at timestamptz, dashboard_link text, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          account_number=EXCLUDED.account_number, routing_number=EXCLUDED.routing_number,
          name=EXCLUDED.name, status=EXCLUDED.status, type=EXCLUDED.type, kind=EXCLUDED.kind,
          nickname=EXCLUDED.nickname, legal_business_name=EXCLUDED.legal_business_name,
          available_balance=EXCLUDED.available_balance, current_balance=EXCLUDED.current_balance,
          created_at=EXCLUDED.created_at, dashboard_link=EXCLUDED.dashboard_link,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryCategories() {
  return withSyncRun("mercury", "category", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/categories", "categories");
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id),
      name: text(r.name),
      visible_for_reimbursements: bool(r.visibleForReimbursements),
      visible_for_card_spend: bool(r.visibleForCardSpend),
      visible_for_other: bool(r.visibleForOther),
      raw: r,
    })).filter((r) => r.id);
    const wrote = await syncRows(sql, "category", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_category
          (id, name, visible_for_reimbursements, visible_for_card_spend, visible_for_other, raw)
        SELECT id, name, visible_for_reimbursements, visible_for_card_spend, visible_for_other, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, name text, visible_for_reimbursements boolean, visible_for_card_spend boolean, visible_for_other boolean, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, visible_for_reimbursements=EXCLUDED.visible_for_reimbursements,
          visible_for_card_spend=EXCLUDED.visible_for_card_spend, visible_for_other=EXCLUDED.visible_for_other,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryRecipients() {
  return withSyncRun("mercury", "recipient", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/recipients", "recipients");
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id),
      status: text(r.status),
      name: text(r.name),
      default_payment_method: text(r.defaultPaymentMethod),
      emails: json(r.emails, []),
      default_address: json(r.defaultAddress),
      electronic_routing_info: json(r.electronicRoutingInfo),
      attachments: json(r.attachments, []),
      raw: r,
    })).filter((r) => r.id);
    const wrote = await syncRows(sql, "recipient", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_recipient
          (id, status, name, default_payment_method, emails, default_address, electronic_routing_info, attachments, raw)
        SELECT id, status, name, default_payment_method, coalesce(emails, '[]'::jsonb), default_address,
               electronic_routing_info, coalesce(attachments, '[]'::jsonb), raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, status text, name text, default_payment_method text, emails jsonb, default_address jsonb,
               electronic_routing_info jsonb, attachments jsonb, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          status=EXCLUDED.status, name=EXCLUDED.name, default_payment_method=EXCLUDED.default_payment_method,
          emails=EXCLUDED.emails, default_address=EXCLUDED.default_address,
          electronic_routing_info=EXCLUDED.electronic_routing_info, attachments=EXCLUDED.attachments,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryTransactions() {
  return withSyncRun("mercury", "transaction", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/transactions?order=asc", "transactions");
    ctx.read(rows.length);
    const normalized = rows.map((r) => {
      const category = child<JsonRecord>(r, "categoryData");
      return {
        id: text(r.id),
        account_id: text(r.accountId),
        fee_id: text(r.feeId),
        card_id: text(r.cardId),
        amount: num(r.amount),
        created_at: text(r.createdAt),
        posted_at: text(r.postedAt),
        estimated_delivery_date: text(r.estimatedDeliveryDate),
        status: text(r.status),
        note: text(r.note),
        bank_description: text(r.bankDescription),
        external_memo: text(r.externalMemo),
        counterparty_id: text(r.counterpartyId),
        counterparty_name: text(r.counterpartyName),
        counterparty_nickname: text(r.counterpartyNickname),
        kind: text(r.kind),
        mercury_category: text(r.mercuryCategory),
        category_id: text(category?.id),
        category_name: text(category?.name),
        general_ledger_code_name: text(r.generalLedgerCodeName),
        compliant_with_receipt_policy: bool(r.compliantWithReceiptPolicy),
        has_generated_receipt: bool(r.hasGeneratedReceipt),
        credit_account_period_id: text(r.creditAccountPeriodId),
        request_id: text(r.requestId),
        check_number: text(r.checkNumber),
        tracking_number: text(r.trackingNumber),
        reason_for_failure: text(r.reasonForFailure),
        failed_at: text(r.failedAt),
        dashboard_link: text(r.dashboardLink),
        details: json(r.details),
        currency_exchange_info: json(r.currencyExchangeInfo),
        gl_allocations: json(r.glAllocations, []),
        attachments: json(r.attachments, []),
        related_transactions: json(r.relatedTransactions, []),
        merchant: json(r.merchant),
        raw: r,
      };
    }).filter((r) => r.id);
    const wrote = await syncRows(sql, "transaction", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_transaction
          (id, account_id, fee_id, card_id, amount, created_at, posted_at, estimated_delivery_date, status,
           note, bank_description, external_memo, counterparty_id, counterparty_name, counterparty_nickname,
           kind, mercury_category, category_id, category_name, general_ledger_code_name,
           compliant_with_receipt_policy, has_generated_receipt, credit_account_period_id, request_id,
           check_number, tracking_number, reason_for_failure, failed_at, dashboard_link, details,
           currency_exchange_info, gl_allocations, attachments, related_transactions, merchant, raw)
        SELECT id, account_id, fee_id, card_id, amount, created_at, posted_at, estimated_delivery_date, status,
               note, bank_description, external_memo, counterparty_id, counterparty_name, counterparty_nickname,
               kind, mercury_category, category_id, category_name, general_ledger_code_name,
               compliant_with_receipt_policy, has_generated_receipt, credit_account_period_id, request_id,
               check_number, tracking_number, reason_for_failure, failed_at, dashboard_link, details,
               currency_exchange_info, coalesce(gl_allocations, '[]'::jsonb), coalesce(attachments, '[]'::jsonb),
               coalesce(related_transactions, '[]'::jsonb), merchant, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, account_id text, fee_id text, card_id text, amount numeric, created_at timestamptz,
               posted_at timestamptz, estimated_delivery_date timestamptz, status text, note text,
               bank_description text, external_memo text, counterparty_id text, counterparty_name text,
               counterparty_nickname text, kind text, mercury_category text, category_id text, category_name text,
               general_ledger_code_name text, compliant_with_receipt_policy boolean,
               has_generated_receipt boolean, credit_account_period_id text, request_id text, check_number text,
               tracking_number text, reason_for_failure text, failed_at timestamptz, dashboard_link text,
               details jsonb, currency_exchange_info jsonb, gl_allocations jsonb, attachments jsonb,
               related_transactions jsonb, merchant jsonb, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          account_id=EXCLUDED.account_id, fee_id=EXCLUDED.fee_id, card_id=EXCLUDED.card_id,
          amount=EXCLUDED.amount, created_at=EXCLUDED.created_at, posted_at=EXCLUDED.posted_at,
          estimated_delivery_date=EXCLUDED.estimated_delivery_date, status=EXCLUDED.status,
          note=EXCLUDED.note, bank_description=EXCLUDED.bank_description, external_memo=EXCLUDED.external_memo,
          counterparty_id=EXCLUDED.counterparty_id, counterparty_name=EXCLUDED.counterparty_name,
          counterparty_nickname=EXCLUDED.counterparty_nickname, kind=EXCLUDED.kind,
          mercury_category=EXCLUDED.mercury_category, category_id=EXCLUDED.category_id,
          category_name=EXCLUDED.category_name, general_ledger_code_name=EXCLUDED.general_ledger_code_name,
          compliant_with_receipt_policy=EXCLUDED.compliant_with_receipt_policy,
          has_generated_receipt=EXCLUDED.has_generated_receipt,
          credit_account_period_id=EXCLUDED.credit_account_period_id, request_id=EXCLUDED.request_id,
          check_number=EXCLUDED.check_number, tracking_number=EXCLUDED.tracking_number,
          reason_for_failure=EXCLUDED.reason_for_failure, failed_at=EXCLUDED.failed_at,
          dashboard_link=EXCLUDED.dashboard_link, details=EXCLUDED.details,
          currency_exchange_info=EXCLUDED.currency_exchange_info, gl_allocations=EXCLUDED.gl_allocations,
          attachments=EXCLUDED.attachments, related_transactions=EXCLUDED.related_transactions,
          merchant=EXCLUDED.merchant, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

async function accountIds(sql: Sql): Promise<string[]> {
  const rows = (await sql`SELECT id FROM core.mercury_account ORDER BY id`) as Array<{ id: string }>;
  return rows.map((r) => r.id);
}

export async function syncMercuryCards() {
  return withSyncRun("mercury", "card", async (ctx) => {
    const sql = osSql();
    const rows: JsonRecord[] = [];
    for (const accountId of await accountIds(sql)) {
      const cards = await mercuryList<JsonRecord>(`/account/${accountId}/cards`, "cards");
      rows.push(...cards.map((card) => ({ ...card, accountId })));
    }
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      card_id: text(r.cardId),
      account_id: text(r.accountId),
      name_on_card: text(r.nameOnCard),
      last_four_digits: text(r.lastFourDigits),
      network: text(r.network),
      status: text(r.status),
      type: text(r.type),
      user_id: text(r.userId),
      spend_limit: json(r.spendLimit),
      created_at: text(r.createdAt),
      updated_at: text(r.updatedAt),
      raw: r,
    })).filter((r) => r.card_id);
    const wrote = await syncRows(sql, "card", ctx.runId, normalized, (r) => String(r.card_id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_card
          (card_id, account_id, name_on_card, last_four_digits, network, status, type, user_id,
           spend_limit, created_at, updated_at, raw)
        SELECT card_id, account_id, name_on_card, last_four_digits, network, status, type, user_id,
               spend_limit, created_at, updated_at, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(card_id text, account_id text, name_on_card text, last_four_digits text, network text,
               status text, type text, user_id text, spend_limit jsonb, created_at timestamptz,
               updated_at timestamptz, raw jsonb)
        ON CONFLICT (card_id) DO UPDATE SET
          account_id=EXCLUDED.account_id, name_on_card=EXCLUDED.name_on_card,
          last_four_digits=EXCLUDED.last_four_digits, network=EXCLUDED.network,
          status=EXCLUDED.status, type=EXCLUDED.type, user_id=EXCLUDED.user_id,
          spend_limit=EXCLUDED.spend_limit, created_at=EXCLUDED.created_at,
          updated_at=EXCLUDED.updated_at, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryStatements() {
  return withSyncRun("mercury", "statement", async (ctx) => {
    const sql = osSql();
    const rows: JsonRecord[] = [];
    for (const accountId of await accountIds(sql)) {
      const statements = await mercuryList<JsonRecord>(`/account/${accountId}/statements?order=desc`, "statements");
      rows.push(...statements.map((statement) => ({ ...statement, accountId })));
    }
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      account_id: text(r.accountId),
      id: text(r.id),
      start_date: text(r.startDate),
      end_date: text(r.endDate),
      account_number: text(r.accountNumber),
      routing_number: text(r.routingNumber),
      company_legal_name: text(r.companyLegalName),
      company_legal_address: json(r.companyLegalAddress),
      ein: text(r.ein),
      ending_balance: num(r.endingBalance),
      download_url: text(r.downloadUrl),
      transactions: json(r.transactions, []),
      raw: r,
    })).filter((r) => r.account_id && r.id);
    const wrote = await syncRows(sql, "statement", ctx.runId, normalized, (r) => `${r.account_id}:${r.id}`, async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_statement
          (account_id, id, start_date, end_date, account_number, routing_number, company_legal_name,
           company_legal_address, ein, ending_balance, download_url, transactions, raw)
        SELECT account_id, id, start_date, end_date, account_number, routing_number, company_legal_name,
               company_legal_address, ein, ending_balance, download_url, coalesce(transactions, '[]'::jsonb), raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(account_id text, id text, start_date date, end_date date, account_number text, routing_number text,
               company_legal_name text, company_legal_address jsonb, ein text, ending_balance numeric,
               download_url text, transactions jsonb, raw jsonb)
        ON CONFLICT (account_id, id) DO UPDATE SET
          start_date=EXCLUDED.start_date, end_date=EXCLUDED.end_date,
          account_number=EXCLUDED.account_number, routing_number=EXCLUDED.routing_number,
          company_legal_name=EXCLUDED.company_legal_name, company_legal_address=EXCLUDED.company_legal_address,
          ein=EXCLUDED.ein, ending_balance=EXCLUDED.ending_balance, download_url=EXCLUDED.download_url,
          transactions=EXCLUDED.transactions, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryCredit() {
  return withSyncRun("mercury", "credit", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/credit", "accounts");
    ctx.read(rows.length);
    const normalized = rows.map((r, index) => ({
      id: text(r.id) ?? text(r.accountId) ?? text(r.creditAccountId) ?? `credit-${index}`,
      name: text(r.name),
      status: text(r.status),
      current_balance: num(r.currentBalance),
      available_balance: num(r.availableBalance),
      raw: r,
    }));
    const wrote = await syncRows(sql, "credit", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_credit_account (id, name, status, current_balance, available_balance, raw)
        SELECT id, name, status, current_balance, available_balance, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, name text, status text, current_balance numeric, available_balance numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, status=EXCLUDED.status, current_balance=EXCLUDED.current_balance,
          available_balance=EXCLUDED.available_balance, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryTreasury() {
  return withSyncRun("mercury", "treasury", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/treasury", "accounts");
    ctx.read(rows.length);
    const normalized = rows.map((r, index) => ({
      id: text(r.id) ?? text(r.accountId) ?? text(r.treasuryAccountId) ?? `treasury-${index}`,
      name: text(r.name),
      status: text(r.status),
      current_balance: num(r.currentBalance),
      available_balance: num(r.availableBalance),
      raw: r,
    }));
    const wrote = await syncRows(sql, "treasury", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_treasury_account (id, name, status, current_balance, available_balance, raw)
        SELECT id, name, status, current_balance, available_balance, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, name text, status text, current_balance numeric, available_balance numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, status=EXCLUDED.status, current_balance=EXCLUDED.current_balance,
          available_balance=EXCLUDED.available_balance, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryTreasuryTransactions() {
  return withSyncRun("mercury", "treasury_transaction", async (ctx) => {
    const sql = osSql();
    const accounts = (await sql`SELECT id FROM core.mercury_treasury_account ORDER BY id`) as Array<{ id: string }>;
    const rows: JsonRecord[] = [];
    for (const account of accounts) {
      const txs = await mercuryList<JsonRecord>(`/treasury/${account.id}/transactions?order=asc`, "transactions", { allow404: true });
      rows.push(...txs.map((tx) => ({ ...tx, treasuryAccountId: account.id })));
    }
    ctx.read(rows.length);
    const normalized = rows.map((r, index) => ({
      id: text(r.id) ?? `${r.treasuryAccountId}:${index}`,
      treasury_account_id: text(r.treasuryAccountId),
      amount: num(r.amount),
      created_at: text(r.createdAt),
      posted_at: text(r.postedAt),
      status: text(r.status),
      kind: text(r.kind),
      description: text(r.description) ?? text(r.bankDescription),
      raw: r,
    }));
    const wrote = await syncRows(sql, "treasury_transaction", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_treasury_transaction
          (id, treasury_account_id, amount, created_at, posted_at, status, kind, description, raw)
        SELECT id, treasury_account_id, amount, created_at, posted_at, status, kind, description, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, treasury_account_id text, amount numeric, created_at timestamptz,
               posted_at timestamptz, status text, kind text, description text, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          treasury_account_id=EXCLUDED.treasury_account_id, amount=EXCLUDED.amount,
          created_at=EXCLUDED.created_at, posted_at=EXCLUDED.posted_at, status=EXCLUDED.status,
          kind=EXCLUDED.kind, description=EXCLUDED.description, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryUsers() {
  return withSyncRun("mercury", "user", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/users", "users");
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      user_id: text(r.userId),
      first_name: text(r.firstName),
      last_name: text(r.lastName),
      email: text(r.email),
      organization_role: text(r.organizationRole),
      raw: r,
    })).filter((r) => r.user_id);
    const wrote = await syncRows(sql, "user", ctx.runId, normalized, (r) => String(r.user_id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_user (user_id, first_name, last_name, email, organization_role, raw)
        SELECT user_id, first_name, last_name, NULLIF(email,'')::citext, organization_role, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(user_id text, first_name text, last_name text, email text, organization_role text, raw jsonb)
        ON CONFLICT (user_id) DO UPDATE SET
          first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, email=EXCLUDED.email,
          organization_role=EXCLUDED.organization_role, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryEvents() {
  return withSyncRun("mercury", "event", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/events?order=asc", "events");
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id),
      resource_type: text(r.resourceType),
      resource_id: text(r.resourceId),
      operation_type: text(r.operationType),
      resource_version: text(r.resourceVersion),
      occurred_at: text(r.occurredAt),
      changed_paths: json(r.changedPaths, []),
      merge_patch: json(r.mergePatch),
      raw: r,
    })).filter((r) => r.id);
    const wrote = await syncRows(sql, "event", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_event
          (id, resource_type, resource_id, operation_type, resource_version, occurred_at, changed_paths, merge_patch, raw)
        SELECT id, resource_type, resource_id, operation_type, resource_version, occurred_at,
               coalesce(changed_paths, '[]'::jsonb), merge_patch, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, resource_type text, resource_id text, operation_type text, resource_version text,
               occurred_at timestamptz, changed_paths jsonb, merge_patch jsonb, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          resource_type=EXCLUDED.resource_type, resource_id=EXCLUDED.resource_id,
          operation_type=EXCLUDED.operation_type, resource_version=EXCLUDED.resource_version,
          occurred_at=EXCLUDED.occurred_at, changed_paths=EXCLUDED.changed_paths,
          merge_patch=EXCLUDED.merge_patch, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercuryWebhooks() {
  return withSyncRun("mercury", "webhook", async (ctx) => {
    const sql = osSql();
    const rows = await mercuryList<JsonRecord>("/webhooks", "webhooks");
    ctx.read(rows.length);
    const normalized = rows.map((r, index) => ({
      id: text(r.id) ?? text(r.webhookId) ?? text(r.url) ?? `webhook-${index}`,
      url: text(r.url),
      status: text(r.status),
      event_types: json(r.eventTypes),
      raw: r,
    }));
    const wrote = await syncRows(sql, "webhook", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.mercury_webhook (id, url, status, event_types, raw)
        SELECT id, url, status, event_types, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, url text, status text, event_types jsonb, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          url=EXCLUDED.url, status=EXCLUDED.status, event_types=EXCLUDED.event_types,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncMercury() {
  const feeds: Array<[string, () => Promise<unknown>]> = [
    ["organization", syncMercuryOrganization],
    ["account", syncMercuryAccounts],
    ["category", syncMercuryCategories],
    ["recipient", syncMercuryRecipients],
    ["transaction", syncMercuryTransactions],
    ["card", syncMercuryCards],
    ["statement", syncMercuryStatements],
    ["credit", syncMercuryCredit],
    ["treasury", syncMercuryTreasury],
    ["treasury_transaction", syncMercuryTreasuryTransactions],
    ["user", syncMercuryUsers],
    ["event", syncMercuryEvents],
    ["webhook", syncMercuryWebhooks],
  ];
  const failures: string[] = [];
  for (const [name, fn] of feeds) {
    try {
      await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${name}: ${message}`);
      console.error(`[mercury] ${name} sync failed; continuing with remaining Mercury feeds: ${message}`);
    }
  }
  if (failures.length) {
    throw new Error(`Mercury sync completed with ${failures.length} failed sub-feed(s): ${failures.join("; ")}`);
  }
}
