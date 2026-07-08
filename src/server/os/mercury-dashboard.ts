import { getOrCompute } from "@/server/cache";
import { osSql } from "./db";

type Row = Record<string, unknown>;
const MIN = 60 * 1000;

const num = (v: unknown): number => Number(v ?? 0);
const str = (v: unknown): string | null => (v == null ? null : String(v));

function canReadOs(): boolean {
  return Boolean(process.env.SWAYZIO_OS_DATABASE_URL);
}

function staleFromFinishedAt(finishedAt: unknown): boolean {
  if (!finishedAt) return true;
  return Date.now() - new Date(String(finishedAt)).getTime() > 8 * 60 * 60 * 1000;
}

export interface MercuryDashboard {
  freshness: {
    updatedAt: string | null;
    stale: boolean;
    rows: Array<{ entity: string; status: string; finishedAt: string | null; rowsRead: number; rowsWritten: number }>;
  };
  snapshot: {
    accounts: number;
    activeAccounts: number;
    availableBalance: number;
    currentBalance: number;
    treasuryBalance: number;
    creditBalance: number;
    transactions: number;
    latestTransactionAt: string | null;
  };
  runway: {
    availableBalance: number;
    inflow90d: number;
    outflow90d: number;
    netCashflow90d: number;
    estimatedMonthlyBurn: number;
    runwayMonths: number | null;
  } | null;
  cashflow: Array<{ label: string; monthStart: string; inflow: number; outflow: number; netCashflow: number; transactions: number }>;
  accounts: Array<{ id: string; name: string; status: string | null; type: string | null; kind: string | null; availableBalance: number; currentBalance: number; dashboardLink: string | null }>;
  spendByCategory: Array<{ category: string; transactions: number; spend: number; lastTransactionAt: string | null }>;
  counterparties: Array<{ id: string | null; counterparty: string; transactions: number; inflow: number; outflow: number; net: number; lastTransactionAt: string | null }>;
  recentTransactions: Array<{ id: string; accountId: string | null; amount: number; transactionAt: string | null; status: string | null; kind: string | null; counterparty: string | null; category: string | null; bankDescription: string | null; note: string | null; dashboardLink: string | null }>;
  cards: Array<{ id: string; accountName: string | null; nameOnCard: string | null; lastFour: string | null; network: string | null; status: string | null; type: string | null }>;
  statements: Array<{ id: string; accountName: string | null; startDate: string | null; endDate: string | null; endingBalance: number; downloadUrl: string | null }>;
  events: Array<{ id: string; resourceType: string | null; operationType: string | null; occurredAt: string | null; changedPaths: unknown }>;
}

export async function getMercuryDashboard(): Promise<MercuryDashboard | null> {
  if (!canReadOs()) return null;
  const sql = osSql();
  const [snapshot] = (await sql`SELECT * FROM api.mercury_cash_snapshot`) as Row[];
  if (!snapshot) return null;
  const [freshRows, runwayRows, cashflow, accounts, spendByCategory, counterparties, recentTransactions, cards, statements, events] = await Promise.all([
    sql`
      SELECT entity, status, finished_at::text AS finished_at, rows_read, rows_written
      FROM api.sync_health
      WHERE source = 'mercury'
      ORDER BY entity
    ` as Promise<Row[]>,
    sql`SELECT * FROM api.mercury_runway_inputs` as Promise<Row[]>,
    sql`
      SELECT month_start::text AS month_start, transactions, inflow, outflow, net_cashflow
      FROM api.mercury_cashflow_monthly
      ORDER BY month_start DESC
      LIMIT 12
    ` as Promise<Row[]>,
    sql`
      SELECT id, name, status, type, kind, available_balance, current_balance, dashboard_link
      FROM api.mercury_accounts
      ORDER BY current_balance DESC NULLS LAST
    ` as Promise<Row[]>,
    sql`SELECT * FROM api.mercury_spend_by_category LIMIT 12` as Promise<Row[]>,
    sql`SELECT * FROM api.mercury_counterparties LIMIT 12` as Promise<Row[]>,
    sql`SELECT * FROM api.mercury_recent_transactions LIMIT 24` as Promise<Row[]>,
    sql`
      SELECT card_id, account_name, name_on_card, last_four_digits, network, status, type
      FROM api.mercury_cards
      ORDER BY status, name_on_card
      LIMIT 16
    ` as Promise<Row[]>,
    sql`
      SELECT id, account_name, start_date::text AS start_date, end_date::text AS end_date,
             ending_balance, download_url
      FROM api.mercury_statements
      LIMIT 12
    ` as Promise<Row[]>,
    sql`
      SELECT id, resource_type, operation_type, occurred_at::text AS occurred_at, changed_paths
      FROM api.mercury_events
      ORDER BY occurred_at DESC NULLS LAST
      LIMIT 12
    ` as Promise<Row[]>,
  ]);

  const updatedAt = freshRows.reduce<string | null>((max, row) => {
    const finished = str(row.finished_at);
    if (!finished) return max;
    return !max || new Date(finished) > new Date(max) ? finished : max;
  }, null);
  const runway = runwayRows[0];

  return {
    freshness: {
      updatedAt,
      stale: staleFromFinishedAt(updatedAt),
      rows: freshRows.map((r) => ({
        entity: String(r.entity),
        status: String(r.status),
        finishedAt: str(r.finished_at),
        rowsRead: num(r.rows_read),
        rowsWritten: num(r.rows_written),
      })),
    },
    snapshot: {
      accounts: num(snapshot.accounts),
      activeAccounts: num(snapshot.active_accounts),
      availableBalance: num(snapshot.available_balance),
      currentBalance: num(snapshot.current_balance),
      treasuryBalance: num(snapshot.treasury_balance),
      creditBalance: num(snapshot.credit_balance),
      transactions: num(snapshot.transactions),
      latestTransactionAt: str(snapshot.latest_transaction_at),
    },
    runway: runway
      ? {
          availableBalance: num(runway.available_balance),
          inflow90d: num(runway.inflow_90d),
          outflow90d: num(runway.outflow_90d),
          netCashflow90d: num(runway.net_cashflow_90d),
          estimatedMonthlyBurn: num(runway.estimated_monthly_burn),
          runwayMonths: runway.runway_months == null ? null : num(runway.runway_months),
        }
      : null,
    cashflow: cashflow.reverse().map((r) => ({
      label: r.month_start ? new Date(String(r.month_start)).toLocaleDateString("en-US", { month: "short", year: "2-digit" }) : "—",
      monthStart: String(r.month_start ?? ""),
      inflow: num(r.inflow),
      outflow: num(r.outflow),
      netCashflow: num(r.net_cashflow),
      transactions: num(r.transactions),
    })),
    accounts: accounts.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? "Mercury account"),
      status: str(r.status),
      type: str(r.type),
      kind: str(r.kind),
      availableBalance: num(r.available_balance),
      currentBalance: num(r.current_balance),
      dashboardLink: str(r.dashboard_link),
    })),
    spendByCategory: spendByCategory.map((r) => ({
      category: String(r.category ?? "Uncategorized"),
      transactions: num(r.transactions),
      spend: num(r.spend),
      lastTransactionAt: str(r.last_transaction_at),
    })),
    counterparties: counterparties.map((r) => ({
      id: str(r.counterparty_id),
      counterparty: String(r.counterparty ?? "Unknown"),
      transactions: num(r.transactions),
      inflow: num(r.inflow),
      outflow: num(r.outflow),
      net: num(r.net),
      lastTransactionAt: str(r.last_transaction_at),
    })),
    recentTransactions: recentTransactions.map((r) => ({
      id: String(r.id),
      accountId: str(r.account_id),
      amount: num(r.amount),
      transactionAt: str(r.transaction_at),
      status: str(r.status),
      kind: str(r.kind),
      counterparty: str(r.counterparty),
      category: str(r.category),
      bankDescription: str(r.bank_description),
      note: str(r.note),
      dashboardLink: str(r.dashboard_link),
    })),
    cards: cards.map((r) => ({
      id: String(r.card_id),
      accountName: str(r.account_name),
      nameOnCard: str(r.name_on_card),
      lastFour: str(r.last_four_digits),
      network: str(r.network),
      status: str(r.status),
      type: str(r.type),
    })),
    statements: statements.map((r) => ({
      id: String(r.id),
      accountName: str(r.account_name),
      startDate: str(r.start_date),
      endDate: str(r.end_date),
      endingBalance: num(r.ending_balance),
      downloadUrl: str(r.download_url),
    })),
    events: events.map((r) => ({
      id: String(r.id),
      resourceType: str(r.resource_type),
      operationType: str(r.operation_type),
      occurredAt: str(r.occurred_at),
      changedPaths: r.changed_paths,
    })),
  };
}

export async function getCachedMercuryDashboard(): Promise<MercuryDashboard | null> {
  const cached = await getOrCompute(
    "os:mercury-dashboard",
    async () => {
      const data = await getMercuryDashboard();
      if (!data) throw new Error("Swayzio OS Mercury dashboard is unavailable");
      return data;
    },
    15 * MIN,
  );
  return { ...cached.data, freshness: { ...cached.data.freshness, stale: cached.data.freshness.stale || cached.meta.stale } };
}
