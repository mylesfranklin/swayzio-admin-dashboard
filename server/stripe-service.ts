import Stripe from 'stripe';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  
  connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret,
  };
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
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
  async getCustomers(limit: number = 100): Promise<StripeCustomerData[]> {
    try {
      const stripe = await getUncachableStripeClient();
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

  async getSubscriptions(limit: number = 100): Promise<StripeSubscriptionData[]> {
    try {
      const stripe = await getUncachableStripeClient();
      const subscriptions = await stripe.subscriptions.list({ 
        limit,
        expand: ['data.items.data.price.product']
      });
      
      return subscriptions.data.map((sub) => {
        const item = sub.items.data[0];
        const price = item?.price;
        const product = price?.product;
        
        return {
          id: sub.id,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status,
          currentPeriodStart: sub.current_period_start,
          currentPeriodEnd: sub.current_period_end,
          planAmount: price?.unit_amount || 0,
          planInterval: price?.recurring?.interval || 'month',
          planName: typeof product === 'object' && product !== null ? (product as any).name : 'Unknown Plan',
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
      const stripe = await getUncachableStripeClient();
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
      const stripe = await getUncachableStripeClient();
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
      const stripe = await getUncachableStripeClient();
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

  async getDashboardStats(): Promise<{
    totalCustomers: number;
    activeSubscriptions: number;
    mrr: number;
    totalRevenue: number;
    recentPayments: StripePaymentData[];
    recentInvoices: StripeInvoiceData[];
    subscriptionsByStatus: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  }> {
    try {
      const [customers, subscriptions, payments, invoices] = await Promise.all([
        this.getCustomers(100),
        this.getSubscriptions(100),
        this.getPaymentIntents(50),
        this.getInvoices(50)
      ]);

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
      subscriptions.forEach(sub => {
        subscriptionsByStatus[sub.status] = (subscriptionsByStatus[sub.status] || 0) + 1;
      });

      const successfulPayments = payments.filter(p => p.status === 'succeeded');
      const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

      const revenueByMonth: Array<{ month: string; revenue: number }> = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = Math.floor(monthDate.getTime() / 1000);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthEnd = Math.floor(nextMonth.getTime() / 1000);
        
        const monthRevenue = successfulPayments
          .filter(p => p.created >= monthStart && p.created < monthEnd)
          .reduce((sum, p) => sum + p.amount, 0);
        
        revenueByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: monthRevenue / 100
        });
      }

      return {
        totalCustomers: customers.length,
        activeSubscriptions: activeSubscriptions.length,
        mrr: mrr / 100,
        totalRevenue: totalRevenue / 100,
        recentPayments: payments.slice(0, 10),
        recentInvoices: invoices.slice(0, 10),
        subscriptionsByStatus,
        revenueByMonth
      };
    } catch (error: any) {
      console.error('Error fetching Stripe dashboard stats:', error.message);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await getCredentials();
      return true;
    } catch {
      return false;
    }
  }
}

export const stripeService = new StripeService();
