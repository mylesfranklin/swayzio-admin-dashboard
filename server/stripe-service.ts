import Stripe from 'stripe';

// Use environment variables directly for Stripe credentials
function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.VITE_STRIPE_PUBLIC_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  return {
    publishableKey: publishableKey || '',
    secretKey,
  };
}

export function getUncachableStripeClient() {
  const { secretKey } = getCredentials();
  // maxNetworkRetries enables the SDK's automatic exponential backoff on 429
  // (rate limit) and transient network errors, which is essential when paginating
  // large datasets with some concurrency.
  return new Stripe(secretKey, {
    maxNetworkRetries: 4,
    timeout: 30000,
  });
}

// Run an async mapper over items with a bounded concurrency. Stripe enforces a
// per-endpoint concurrency/rate limit, so fanning out hundreds of pages at once
// trips 429s; a small pool keeps us fast while staying under the limit.
async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

export function getStripePublishableKey() {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

export interface StripeCustomerData {
  id: string;
  email: string;
  name: string;
  created: number;
  currency?: string;
  balance: number;
  delinquent: boolean;
}

export interface StripeSubscriptionData {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  planAmount: number;
  planInterval: string;
  planName: string;
  monthlyAmount: number; // normalized monthly MRR contribution in cents (quantity + interval_count + discount aware)
  currency: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
  created: number;
}

// Normalize any recurring amount (in cents) to its monthly-equivalent value in cents.
// Accounts for interval (day/week/month/year) and interval_count (e.g. billed every 3 months).
function normalizeToMonthlyCents(amountCents: number, interval: string, intervalCount?: number): number {
  const ic = intervalCount && intervalCount > 0 ? intervalCount : 1;
  switch (interval) {
    case 'year':
      return amountCents / (12 * ic);
    case 'week':
      return (amountCents * 52) / (12 * ic);
    case 'day':
      return (amountCents * 365) / (12 * ic);
    case 'month':
    default:
      return amountCents / ic;
  }
}

export interface StripePaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customerId?: string;
  description?: string;
}

export interface StripeInvoiceData {
  id: string;
  customerId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  created: number;
  dueDate?: number;
  paid: boolean;
  number?: string;
}

export class StripeService {
  async getAllCustomers(): Promise<StripeCustomerData[]> {
    try {
      const stripe = getUncachableStripeClient();
      const allCustomers: StripeCustomerData[] = [];
      let startingAfter: string | undefined;
      
      do {
        const params: any = { limit: 100 };
        if (startingAfter) params.starting_after = startingAfter;
        
        const customers = await stripe.customers.list(params);
        
        const mapped = customers.data.map((customer) => ({
          id: customer.id,
          email: customer.email || '',
          name: customer.name || '',
          created: customer.created,
          currency: customer.currency || undefined,
          balance: customer.balance || 0,
          delinquent: customer.delinquent || false
        }));
        
        allCustomers.push(...mapped);
        startingAfter = customers.has_more ? customers.data[customers.data.length - 1]?.id : undefined;
        
        console.log(`Fetched ${allCustomers.length} Stripe customers...`);
      } while (startingAfter);
      
      console.log(`Total Stripe customers: ${allCustomers.length}`);
      return allCustomers;
    } catch (error: any) {
      console.error('Error fetching Stripe customers:', error.message);
      throw error;
    }
  }

  async getCustomers(limit: number = 100): Promise<StripeCustomerData[]> {
    try {
      const stripe = getUncachableStripeClient();
      const customers = await stripe.customers.list({ limit });
      
      return customers.data.map((customer) => ({
        id: customer.id,
        email: customer.email || '',
        name: customer.name || '',
        created: customer.created,
        currency: customer.currency || undefined,
        balance: customer.balance || 0,
        delinquent: customer.delinquent || false
      }));
    } catch (error: any) {
      console.error('Error fetching Stripe customers:', error.message);
      throw error;
    }
  }

  private mapSubscriptionData(subRaw: any): StripeSubscriptionData {
    const sub: any = subRaw;
    const items: any[] = sub.items?.data || [];

    // Sum every recurring line item, normalized to a monthly amount and
    // multiplied by quantity. One-time (non-recurring) items are skipped.
    let monthlyCents = 0;
    for (const item of items) {
      const price = item.price;
      if (!price || !price.recurring) continue;
      const unit = price.unit_amount || 0;
      const qty = item.quantity || 1;
      monthlyCents += normalizeToMonthlyCents(unit * qty, price.recurring.interval, price.recurring.interval_count);
    }

    // Apply an active subscription-level discount (coupon).
    // Only forever/repeating coupons reduce ongoing MRR; one-time coupons do not.
    const discount = sub.discount
      || (Array.isArray(sub.discounts) ? sub.discounts.find((d: any) => d && typeof d === 'object' && d.coupon) : null);
    const coupon = discount?.coupon;
    if (coupon && (coupon.duration === 'forever' || coupon.duration === 'repeating')) {
      if (coupon.percent_off) {
        monthlyCents *= (1 - coupon.percent_off / 100);
      } else if (coupon.amount_off) {
        const firstRecurring = items.find((i: any) => i.price?.recurring)?.price;
        if (firstRecurring?.recurring) {
          monthlyCents -= normalizeToMonthlyCents(coupon.amount_off, firstRecurring.recurring.interval, firstRecurring.recurring.interval_count);
        }
      }
    }
    if (monthlyCents < 0) monthlyCents = 0;

    const firstItem = items[0];
    const price = firstItem?.price;
    const cust = sub.customer;
    const customerIsObject = cust && typeof cust === 'object';
    const customerId = customerIsObject ? cust.id : (cust || '');
    const customerName = customerIsObject && !cust.deleted
      ? (cust.name || cust.email || cust.id)
      : customerId;

    return {
      id: sub.id,
      customerId,
      customerName,
      status: sub.status,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      planAmount: price?.unit_amount || 0,
      planInterval: price?.recurring?.interval || 'month',
      planName: price?.nickname || `Plan ${price?.id?.slice(-8) || 'Unknown'}`,
      monthlyAmount: Math.round(monthlyCents),
      currency: (price?.currency || 'usd'),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ?? null,
      created: sub.created
    } as StripeSubscriptionData;
  }

  /**
   * Fetch subscriptions with full pagination.
   * - Omit `status` to fetch all non-canceled subscriptions (active, trialing,
   *   past_due, unpaid, incomplete, paused) — used for MRR and active counts.
   * - Pass status: 'canceled' (with maxPages) to fetch recently-canceled
   *   subscriptions for churn/history. Canceled subs are ordered by creation
   *   date desc, so maxPages bounds the fetch to the most recent signups.
   */
  async getAllSubscriptions(opts: { status?: string; maxPages?: number; created?: { gte: number; lt: number } } = {}): Promise<StripeSubscriptionData[]> {
    try {
      const stripe = getUncachableStripeClient();
      const allSubscriptions: StripeSubscriptionData[] = [];
      let startingAfter: string | undefined;
      let pages = 0;
      const maxPages = opts.maxPages ?? 0; // 0 = unlimited

      do {
        const params: any = {
          limit: 100,
          expand: ['data.items.data.price', 'data.customer']
        };
        if (opts.status) params.status = opts.status;
        if (opts.created) params.created = opts.created;
        if (startingAfter) params.starting_after = startingAfter;

        const subscriptions = await stripe.subscriptions.list(params);
        allSubscriptions.push(...subscriptions.data.map((s) => this.mapSubscriptionData(s)));

        pages += 1;
        startingAfter = subscriptions.has_more ? subscriptions.data[subscriptions.data.length - 1]?.id : undefined;
        if (maxPages > 0 && pages >= maxPages) startingAfter = undefined;
      } while (startingAfter);

      return allSubscriptions;
    } catch (error: any) {
      console.error('Error fetching Stripe subscriptions:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all non-canceled subscriptions by issuing parallel queries sliced by
   * creation time. A single sequential cursor walk over thousands of subs is the
   * dominant cost of the dashboard fetch; slicing by `created` (finer for recent
   * periods where signups concentrate) cuts wall-clock time roughly N-fold.
   */
  async getNonCanceledSubscriptions(): Promise<StripeSubscriptionData[]> {
    const now = Math.floor(Date.now() / 1000) + 1; // +1 so subs created "now" are included
    const MONTH = 30 * 24 * 60 * 60;
    const ago = (m: number) => now - m * MONTH;
    // Descending boundaries; consecutive pairs form [gte, lt) buckets with no gaps/overlap.
    const boundaries = [
      now,
      ago(1), ago(2), ago(3), ago(4), ago(5), ago(6),
      ago(9), ago(12), ago(18), ago(24), ago(36), ago(48), ago(60),
      0
    ];
    const ranges: Array<{ gte: number; lt: number }> = [];
    for (let i = 0; i < boundaries.length - 1; i++) {
      ranges.push({ gte: boundaries[i + 1], lt: boundaries[i] });
    }
    const results = await mapWithConcurrency(ranges, 4, (r) => this.getAllSubscriptions({ created: r }));
    const all = results.flat();
    console.log(`Fetched ${all.length} non-canceled Stripe subscriptions (${ranges.length} buckets, concurrency 4)`);
    return all;
  }

  /**
   * Fetch SUCCEEDED charges within a created-time range [gte, lt) via the Search API.
   * Revenue only counts successful charges, and a `status:'succeeded'` filter skips
   * the very large volume of failed charges generated by past_due subscriptions —
   * which is what made a plain charges.list pagination prohibitively slow.
   */
  private async getChargesInRange(gte: number, lt: number): Promise<Array<{ amount: number; status: string; paid: boolean; created: number; amountRefunded: number }>> {
    const stripe = getUncachableStripeClient();
    const out: Array<{ amount: number; status: string; paid: boolean; created: number; amountRefunded: number }> = [];
    const query = `status:"succeeded" AND created>=${gte} AND created<${lt}`;
    let page: string | undefined;

    do {
      const params: any = { query, limit: 100 };
      if (page) params.page = page;
      const charges = await stripe.charges.search(params);
      for (const c of charges.data as any[]) {
        out.push({
          amount: c.amount || 0,
          status: c.status,
          paid: c.paid,
          created: c.created,
          amountRefunded: c.amount_refunded || 0
        });
      }
      page = charges.has_more ? (charges.next_page as string) : undefined;
    } while (page);

    return out;
  }

  /**
   * Fetch the trailing `monthsBack` calendar months of SUCCEEDED charges by issuing
   * one paginated search per month in parallel. Filtering to succeeded charges keeps
   * the result set small, so this completes quickly even with high charge volume.
   */
  async getChargesByMonth(monthsBack: number = 12): Promise<Array<{ amount: number; status: string; paid: boolean; created: number; amountRefunded: number }>> {
    const now = new Date();
    const ranges: Array<{ gte: number; lt: number }> = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      ranges.push({ gte: Math.floor(start.getTime() / 1000), lt: Math.floor(end.getTime() / 1000) });
    }
    // The Search API has a lower rate limit than list endpoints; concurrency 4 stays
    // safely under it while running several months in parallel.
    const results = await mapWithConcurrency(ranges, 4, (r) => this.getChargesInRange(r.gte, r.lt));
    const all = results.flat();
    console.log(`Fetched ${all.length} succeeded Stripe charges across ${monthsBack} months (concurrency 4)`);
    return all;
  }

  async getSubscriptions(limit: number = 100): Promise<StripeSubscriptionData[]> {
    try {
      const stripe = getUncachableStripeClient();
      const subscriptions = await stripe.subscriptions.list({ 
        limit,
        expand: ['data.items.data.price']
      });
      
      return subscriptions.data.map((sub) => {
        const item = sub.items.data[0];
        const price = item?.price;
        
        return {
          id: sub.id,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status,
          currentPeriodStart: sub.current_period_start,
          currentPeriodEnd: sub.current_period_end,
          planAmount: price?.unit_amount || 0,
          planInterval: price?.recurring?.interval || 'month',
          planName: price?.nickname || `Plan ${price?.id?.slice(-8) || 'Unknown'}`,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          created: sub.created
        };
      });
    } catch (error: any) {
      console.error('Error fetching Stripe subscriptions:', error.message);
      throw error;
    }
  }

  async getPaymentIntents(limit: number = 100): Promise<StripePaymentData[]> {
    try {
      const stripe = getUncachableStripeClient();
      const payments = await stripe.paymentIntents.list({ limit });
      
      return payments.data.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        created: payment.created,
        customerId: typeof payment.customer === 'string' ? payment.customer : payment.customer?.id,
        description: payment.description || undefined
      }));
    } catch (error: any) {
      console.error('Error fetching Stripe payments:', error.message);
      throw error;
    }
  }

  async getInvoices(limit: number = 100): Promise<StripeInvoiceData[]> {
    try {
      const stripe = getUncachableStripeClient();
      const invoices = await stripe.invoices.list({ limit });
      
      return invoices.data.map((invoice) => ({
        id: invoice.id,
        customerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '',
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status || 'unknown',
        created: invoice.created,
        dueDate: invoice.due_date || undefined,
        paid: invoice.paid,
        number: invoice.number || undefined
      }));
    } catch (error: any) {
      console.error('Error fetching Stripe invoices:', error.message);
      throw error;
    }
  }

  async getCharges(limit: number = 100): Promise<any[]> {
    try {
      const stripe = getUncachableStripeClient();
      const charges = await stripe.charges.list({ limit });
      
      return charges.data.map((charge) => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        created: charge.created,
        customerId: typeof charge.customer === 'string' ? charge.customer : charge.customer?.id,
        description: charge.description,
        paid: charge.paid,
        refunded: charge.refunded
      }));
    } catch (error: any) {
      console.error('Error fetching Stripe charges:', error.message);
      throw error;
    }
  }

  async getGrossVolume(maxPages: number = 0): Promise<{ grossVolume: number; transactionCount: number }> {
    try {
      const stripe = getUncachableStripeClient();
      let totalGross = 0;
      let startingAfter: string | undefined;
      let count = 0;
      let pages = 0;
      
      do {
        const params: Stripe.BalanceTransactionListParams = { 
          limit: 100,
          type: 'charge'
        };
        if (startingAfter) params.starting_after = startingAfter;
        
        const transactions = await stripe.balanceTransactions.list(params);
        
        for (const txn of transactions.data) {
          totalGross += txn.amount;
        }
        
        count += transactions.data.length;
        pages++;
        startingAfter = transactions.has_more ? transactions.data[transactions.data.length - 1]?.id : undefined;
        
        if (count % 5000 === 0) {
          console.log(`Processed ${count} balance transactions for gross volume...`);
        }
        
        if (maxPages > 0 && pages >= maxPages) break;
      } while (startingAfter);
      
      console.log(`Total balance transactions processed: ${count}, Gross volume: $${(totalGross / 100).toFixed(2)}`);
      return { grossVolume: totalGross, transactionCount: count };
    } catch (error: any) {
      console.error('Error fetching gross volume:', error.message);
      throw error;
    }
  }

  async getRecentCharges(monthsBack: number = 12, maxPages: number = 30): Promise<any[]> {
    try {
      const stripe = getUncachableStripeClient();
      const allCharges: any[] = [];
      let startingAfter: string | undefined;
      let pages = 0;
      
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);
      const createdGte = Math.floor(startDate.getTime() / 1000);
      
      do {
        const params: Stripe.ChargeListParams = { 
          limit: 100,
          created: { gte: createdGte }
        };
        if (startingAfter) params.starting_after = startingAfter;
        
        const charges = await stripe.charges.list(params);
        
        const mapped = charges.data.map((charge) => ({
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          created: charge.created,
          customerId: typeof charge.customer === 'string' ? charge.customer : charge.customer?.id,
          description: charge.description,
          paid: charge.paid,
          refunded: charge.refunded,
          amountRefunded: charge.amount_refunded
        }));
        
        allCharges.push(...mapped);
        pages++;
        startingAfter = charges.has_more ? charges.data[charges.data.length - 1]?.id : undefined;
        
        if (allCharges.length % 1000 === 0) {
          console.log(`Fetched ${allCharges.length} recent charges (last ${monthsBack} months)...`);
        }
        
        if (maxPages > 0 && pages >= maxPages) break;
      } while (startingAfter);
      
      console.log(`Total recent charges (${monthsBack} months): ${allCharges.length}`);
      return allCharges;
    } catch (error: any) {
      console.error('Error fetching recent charges:', error.message);
      throw error;
    }
  }

  async getBalanceTransactions(limit: number = 100): Promise<any[]> {
    try {
      const stripe = getUncachableStripeClient();
      const transactions = await stripe.balanceTransactions.list({ limit });
      
      return transactions.data.map((txn) => ({
        id: txn.id,
        amount: txn.amount,
        net: txn.net,
        fee: txn.fee,
        currency: txn.currency,
        type: txn.type,
        status: txn.status,
        created: txn.created,
        description: txn.description,
        source: txn.source
      }));
    } catch (error: any) {
      console.error('Error fetching Stripe balance transactions:', error.message);
      throw error;
    }
  }

  async getProducts(): Promise<any[]> {
    try {
      const stripe = getUncachableStripeClient();
      const products = await stripe.products.list({ limit: 100, active: true });
      
      return products.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        created: product.created
      }));
    } catch (error: any) {
      console.error('Error fetching Stripe products:', error.message);
      throw error;
    }
  }

  async getPrices(): Promise<any[]> {
    try {
      const stripe = getUncachableStripeClient();
      const prices = await stripe.prices.list({ limit: 100, active: true });
      
      return prices.data.map((price) => ({
        id: price.id,
        productId: typeof price.product === 'string' ? price.product : price.product?.id,
        unitAmount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
        nickname: price.nickname,
        active: price.active
      }));
    } catch (error: any) {
      console.error('Error fetching Stripe prices:', error.message);
      throw error;
    }
  }

  // Separate method: full customer pagination for 24h cache (slow, ~40s)
  async getCustomerCount(): Promise<number> {
    console.log('Fetching total Stripe customer count (full pagination)...');
    const allCustomers = await this.getAllCustomers();
    console.log(`Total Stripe customer count: ${allCustomers.length}`);
    return allCustomers.length;
  }

  async getDashboardStats(): Promise<{
    totalCustomers: number;
    activeSubscriptions: number;
    mrr: number;
    totalRevenue: number;
    churnRate: number;
    recentPayments: StripePaymentData[];
    recentInvoices: StripeInvoiceData[];
    subscriptionsByStatus: Record<string, number>;
    subscriptionsByPlan: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number; mrr: number; subscribers: number }>;
    activeSubscriptionsList: Array<{
      id: string;
      customer: string;
      plan: string;
      amount: number;
      status: string;
      nextBillingDate: string;
    }>;
  }> {
    try {
      console.log('Starting Stripe dashboard stats fetch (accuracy path)...');

      // Accuracy is prioritized over cold-start speed: full pagination runs in the
      // cached/background path so dashboard requests are served from cache and never wait.
      // Customer count and 12-month revenue history are each served from their own
      // separate caches (getCustomerCount / getRevenueHistory). Revenue is decoupled
      // because charge volume (inflated by repeated failed charges from past_due subs)
      // can be huge and slow to paginate; keeping it out of this path ensures the core
      // subscription metrics (MRR, churn, active table) populate fast and reliably.
      const [nonCanceled, recentlyCanceled] = await Promise.all([
        this.getNonCanceledSubscriptions(),                    // non-canceled subs for MRR + active counts (parallel)
        this.getAllSubscriptions({ status: 'canceled', maxPages: 60 }) // recent canceled subs for churn + history
      ]);
      const [payments, invoices] = await Promise.all([
        this.getPaymentIntents(100),
        this.getInvoices(100)
      ]);
      const subscriptions = [...nonCanceled, ...recentlyCanceled];

      console.log('All Stripe data fetched, calculating stats...');

      const now = new Date();
      const nowTs = Math.floor(now.getTime() / 1000);

      // Only count truly active subscriptions for MRR
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

      // MRR = sum of each active subscription's normalized monthly amount (quantity,
      // interval_count, multi-item and discounts already applied in getAllSubscriptions).
      const mrrCents = activeSubscriptions.reduce((sum, sub) => sum + sub.monthlyAmount, 0);

      // Diagnostic breakdowns (helps verify accuracy against the Stripe dashboard)
      const currencyBreakdown: Record<string, number> = {};
      activeSubscriptions.forEach(s => {
        currencyBreakdown[s.currency] = (currencyBreakdown[s.currency] || 0) + 1;
      });
      const trialingCents = subscriptions.filter(s => s.status === 'trialing').reduce((sum, s) => sum + s.monthlyAmount, 0);
      const pastDueCents = subscriptions.filter(s => s.status === 'past_due').reduce((sum, s) => sum + s.monthlyAmount, 0);
      console.log(`MRR: $${(mrrCents / 100).toFixed(2)} from ${activeSubscriptions.length} active subs`);
      console.log(`  (excluded) trialing: $${(trialingCents / 100).toFixed(2)}, past_due: $${(pastDueCents / 100).toFixed(2)}`);
      console.log(`  active currency breakdown: ${JSON.stringify(currencyBreakdown)}`);

      const subscriptionsByStatus: Record<string, number> = {};
      const subscriptionsByPlan: Record<string, number> = {};
      subscriptions.forEach(sub => {
        subscriptionsByStatus[sub.status] = (subscriptionsByStatus[sub.status] || 0) + 1;
        if (sub.status === 'active') {
          subscriptionsByPlan[sub.planName] = (subscriptionsByPlan[sub.planName] || 0) + 1;
        }
      });

      // Churn rate (monthly): subscriptions canceled in the last 30 days divided by
      // the subscriptions that were active at the start of that window.
      const thirtyDaysAgoTs = nowTs - 30 * 24 * 60 * 60;
      const canceledLast30Days = subscriptions.filter(
        s => s.canceledAt != null && s.canceledAt >= thirtyDaysAgoTs
      ).length;
      const activeAtStart = activeSubscriptions.length + canceledLast30Days;
      const churnRate = activeAtStart > 0
        ? Math.min(100, (canceledLast30Days / activeAtStart) * 100)
        : 0;
      console.log(`Churn rate (30d): ${churnRate.toFixed(2)}% (${canceledLast30Days} canceled / ${activeAtStart} active at start)`);

      // Monthly series: real per-month revenue (from charges) plus reconstructed MRR and
      // active-subscriber counts derived from each subscription's lifecycle (created/canceledAt).
      const revenueByMonth: Array<{ month: string; revenue: number; mrr: number; subscribers: number }> = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthEndExclusive = Math.floor(nextMonth.getTime() / 1000);
        // Point-in-time snapshot taken at month end (or now for the current month).
        const snapshotTs = Math.min(monthEndExclusive - 1, nowTs);

        // Reconstruct the trend on the same basis as the headline MRR (active
        // subscriptions only). Canceled subs are included for the months they
        // were still active so the trend shows real growth/churn; past_due,
        // paused and incomplete subs are excluded so the latest month matches
        // the active-only headline MRR.
        let monthMrrCents = 0;
        let monthSubscribers = 0;
        for (const s of subscriptions) {
          if (s.status !== 'active' && s.status !== 'canceled') continue;
          if (s.created > snapshotTs) continue;
          if (s.canceledAt != null && s.canceledAt <= snapshotTs) continue;
          monthMrrCents += s.monthlyAmount;
          monthSubscribers += 1;
        }

        // revenue is filled in by the route layer from the separate revenue cache.
        revenueByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: 0,
          mrr: Math.round(monthMrrCents / 100),
          subscribers: monthSubscribers
        });
      }

      // Top active subscriptions for the dashboard table (capped to keep payload light)
      const activeSubscriptionsList = activeSubscriptions
        .slice()
        .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
        .slice(0, 100)
        .map(s => ({
          id: s.id,
          customer: s.customerName || s.customerId,
          plan: s.planName,
          amount: s.monthlyAmount / 100,
          status: s.status,
          nextBillingDate: s.currentPeriodEnd ? new Date(s.currentPeriodEnd * 1000).toISOString() : ''
        }));

      console.log(`Stripe dashboard stats complete. MRR: $${(mrrCents / 100).toFixed(2)}, active subs: ${activeSubscriptions.length}`);

      return {
        totalCustomers: 0, // Populated by route layer from separate 24h customer-count cache
        activeSubscriptions: activeSubscriptions.length,
        mrr: mrrCents / 100,
        totalRevenue: 0, // Populated by route layer from separate revenue cache
        churnRate,
        recentPayments: payments.slice(0, 10),
        recentInvoices: invoices.slice(0, 10),
        subscriptionsByStatus,
        subscriptionsByPlan,
        revenueByMonth,
        activeSubscriptionsList
      };
    } catch (error: any) {
      console.error('Error fetching Stripe dashboard stats:', error.message);
      throw error;
    }
  }

  /**
   * Heavy trailing-12-month revenue history derived from successful charges, keyed by
   * the same "MMM YY" month labels used by getDashboardStats. Fetched and cached
   * SEPARATELY from the core dashboard stats: charge volume is inflated by repeated
   * failed charges from past_due subscriptions, so this pagination can be large and
   * slow. Isolating it keeps the core subscription metrics fast and never blocks them.
   */
  async getRevenueHistory(): Promise<{ totalRevenue: number; byMonth: Record<string, number> }> {
    console.log('Starting Stripe revenue history fetch (12-month charges)...');
    const charges = await this.getChargesByMonth(12);
    const successful = charges.filter((c) => c.paid === true && c.status === 'succeeded');

    const now = new Date();
    const byMonth: Record<string, number> = {};
    let totalCents = 0;
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = Math.floor(monthDate.getTime() / 1000);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthEndExclusive = Math.floor(nextMonth.getTime() / 1000);
      const cents = successful
        .filter((c) => c.created >= monthStart && c.created < monthEndExclusive)
        .reduce((sum, c) => sum + (c.amount - (c.amountRefunded || 0)), 0);
      const label = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      byMonth[label] = Math.round(cents / 100);
      totalCents += cents;
    }

    console.log(`Stripe revenue history complete. 12m revenue: $${(totalCents / 100).toFixed(2)} from ${successful.length} successful charges`);
    return { totalRevenue: totalCents / 100, byMonth };
  }

  isConnected(): boolean {
    try {
      getCredentials();
      return true;
    } catch {
      return false;
    }
  }
}

export const stripeService = new StripeService();
