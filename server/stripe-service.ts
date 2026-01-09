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
  return new Stripe(secretKey);
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
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  planAmount: number;
  planInterval: string;
  planName: string;
  cancelAtPeriodEnd: boolean;
  created: number;
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

  async getAllSubscriptions(): Promise<StripeSubscriptionData[]> {
    try {
      const stripe = getUncachableStripeClient();
      const allSubscriptions: StripeSubscriptionData[] = [];
      let startingAfter: string | undefined;
      
      do {
        const params: any = { 
          limit: 100,
          expand: ['data.items.data.price']
        };
        if (startingAfter) params.starting_after = startingAfter;
        
        const subscriptions = await stripe.subscriptions.list(params);
        
        const mapped = subscriptions.data.map((sub) => {
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
        
        allSubscriptions.push(...mapped);
        startingAfter = subscriptions.has_more ? subscriptions.data[subscriptions.data.length - 1]?.id : undefined;
        
        console.log(`Fetched ${allSubscriptions.length} Stripe subscriptions...`);
      } while (startingAfter);
      
      console.log(`Total Stripe subscriptions: ${allSubscriptions.length}`);
      return allSubscriptions;
    } catch (error: any) {
      console.error('Error fetching Stripe subscriptions:', error.message);
      throw error;
    }
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

  async getDashboardStats(): Promise<{
    totalCustomers: number;
    activeSubscriptions: number;
    mrr: number;
    totalRevenue: number;
    recentPayments: StripePaymentData[];
    recentInvoices: StripeInvoiceData[];
    subscriptionsByStatus: Record<string, number>;
    subscriptionsByPlan: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  }> {
    try {
      console.log('Starting Stripe dashboard stats fetch...');
      
      const [customers, subscriptions, grossVolumeData, recentCharges, payments, invoices] = await Promise.all([
        this.getAllCustomers(),
        this.getAllSubscriptions(),
        this.getGrossVolume(50),
        this.getRecentCharges(12),
        this.getPaymentIntents(100),
        this.getInvoices(100)
      ]);

      console.log('All Stripe data fetched, calculating stats...');

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
      const mrr = activeSubscriptions.reduce((sum, sub) => {
        let monthlyAmount = sub.planAmount;
        if (sub.planInterval === 'year') {
          monthlyAmount = sub.planAmount / 12;
        } else if (sub.planInterval === 'week') {
          monthlyAmount = sub.planAmount * 4;
        }
        return sum + monthlyAmount;
      }, 0);

      const subscriptionsByStatus: Record<string, number> = {};
      const subscriptionsByPlan: Record<string, number> = {};
      subscriptions.forEach(sub => {
        subscriptionsByStatus[sub.status] = (subscriptionsByStatus[sub.status] || 0) + 1;
        if (sub.status === 'active') {
          subscriptionsByPlan[sub.planName] = (subscriptionsByPlan[sub.planName] || 0) + 1;
        }
      });

      const successfulCharges = recentCharges.filter((c: any) => c.paid === true && c.status === 'succeeded');

      const revenueByMonth: Array<{ month: string; revenue: number }> = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = Math.floor(monthDate.getTime() / 1000);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthEnd = Math.floor(nextMonth.getTime() / 1000);
        
        const monthRevenue = successfulCharges
          .filter((c: any) => c.created >= monthStart && c.created < monthEnd)
          .reduce((sum: number, c: any) => sum + (c.amount - (c.amountRefunded || 0)), 0);
        
        revenueByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: monthRevenue / 100
        });
      }

      console.log('Stripe dashboard stats complete');

      return {
        totalCustomers: customers.length,
        activeSubscriptions: activeSubscriptions.length,
        mrr: mrr / 100,
        totalRevenue: grossVolumeData.grossVolume / 100,
        recentPayments: payments.slice(0, 10),
        recentInvoices: invoices.slice(0, 10),
        subscriptionsByStatus,
        subscriptionsByPlan,
        revenueByMonth
      };
    } catch (error: any) {
      console.error('Error fetching Stripe dashboard stats:', error.message);
      throw error;
    }
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
