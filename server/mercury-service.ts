interface MercuryAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'treasury';
  status: string;
  currentBalance: number;
  availableBalance: number;
  accountNumber: string;
  routingNumber: string;
  createdAt: string;
}

interface MercuryTransaction {
  id: string;
  amount: number;
  bankDescription: string;
  counterpartyName: string;
  counterpartyNickname?: string;
  createdAt: string;
  dashboardLink: string;
  details?: {
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
    domesticWireRoutingInfo?: {
      bankName?: string;
      accountNumber?: string;
      routingNumber?: string;
    };
  };
  estimatedDeliveryDate?: string;
  failedAt?: string;
  kind: string;
  note?: string;
  postedAt?: string;
  reasonForFailure?: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  feeId?: string;
}

interface MercuryDashboardStats {
  accounts: MercuryAccount[];
  totalBalance: number;
  recentTransactions: MercuryTransaction[];
  cashFlowByMonth: Array<{ month: string; inflow: number; outflow: number }>;
  transactionsByType: Record<string, number>;
}

const MERCURY_API_BASE = 'https://api.mercury.com/api/v1';

function getApiToken(): string {
  const token = process.env.MERCURY_API_KEY;
  if (!token) {
    throw new Error('MERCURY_API_KEY environment variable is not set');
  }
  return token;
}

async function mercuryFetch(endpoint: string): Promise<any> {
  const token = getApiToken();
  
  const response = await fetch(`${MERCURY_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mercury API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export class MercuryService {
  async getAccounts(): Promise<MercuryAccount[]> {
    try {
      const data = await mercuryFetch('/accounts');
      
      return (data.accounts || []).map((account: any) => ({
        id: account.id,
        name: account.name,
        type: account.type || 'checking',
        status: account.status,
        currentBalance: account.currentBalance || 0,
        availableBalance: account.availableBalance || 0,
        accountNumber: account.accountNumber,
        routingNumber: account.routingNumber,
        createdAt: account.createdAt
      }));
    } catch (error: any) {
      console.error('Error fetching Mercury accounts:', error.message);
      throw error;
    }
  }

  async getTransactions(accountId: string, limit: number = 100): Promise<MercuryTransaction[]> {
    try {
      const data = await mercuryFetch(`/accounts/${accountId}/transactions?limit=${limit}`);
      
      return (data.transactions || []).map((txn: any) => ({
        id: txn.id,
        amount: txn.amount || 0,
        bankDescription: txn.bankDescription || '',
        counterpartyName: txn.counterpartyName || 'Unknown',
        counterpartyNickname: txn.counterpartyNickname,
        createdAt: txn.createdAt,
        dashboardLink: txn.dashboardLink || '',
        details: txn.details,
        estimatedDeliveryDate: txn.estimatedDeliveryDate,
        failedAt: txn.failedAt,
        kind: txn.kind || 'unknown',
        note: txn.note,
        postedAt: txn.postedAt,
        reasonForFailure: txn.reasonForFailure,
        status: txn.status || 'pending',
        feeId: txn.feeId
      }));
    } catch (error: any) {
      console.error('Error fetching Mercury transactions:', error.message);
      throw error;
    }
  }

  async getAllTransactions(limit: number = 500): Promise<MercuryTransaction[]> {
    try {
      const accounts = await this.getAccounts();
      const allTransactions: MercuryTransaction[] = [];
      
      for (const account of accounts) {
        try {
          const transactions = await this.getTransactions(account.id, limit);
          allTransactions.push(...transactions);
        } catch (err: any) {
          console.log(`Skipping transactions for account ${account.id}: ${err.message}`);
        }
      }
      
      allTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return allTransactions;
    } catch (error: any) {
      console.error('Error fetching all Mercury transactions:', error.message);
      throw error;
    }
  }

  async getDashboardStats(): Promise<MercuryDashboardStats> {
    try {
      const accounts = await this.getAccounts();
      const transactions = await this.getAllTransactions(200);
      
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
      
      const transactionsByType: Record<string, number> = {};
      transactions.forEach(txn => {
        const kind = txn.kind || 'other';
        transactionsByType[kind] = (transactionsByType[kind] || 0) + 1;
      });
      
      const cashFlowByMonth: Array<{ month: string; inflow: number; outflow: number }> = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        let inflow = 0;
        let outflow = 0;
        
        transactions.forEach(txn => {
          const txnDate = new Date(txn.createdAt);
          if (txnDate >= monthDate && txnDate < nextMonth) {
            if (txn.amount > 0) {
              inflow += txn.amount;
            } else {
              outflow += Math.abs(txn.amount);
            }
          }
        });
        
        cashFlowByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          inflow,
          outflow
        });
      }
      
      return {
        accounts,
        totalBalance,
        recentTransactions: transactions.slice(0, 20),
        cashFlowByMonth,
        transactionsByType
      };
    } catch (error: any) {
      console.error('Error fetching Mercury dashboard stats:', error.message);
      return {
        accounts: [],
        totalBalance: 0,
        recentTransactions: [],
        cashFlowByMonth: [],
        transactionsByType: {}
      };
    }
  }

  isConnected(): boolean {
    try {
      getApiToken();
      return true;
    } catch {
      return false;
    }
  }
}

export const mercuryService = new MercuryService();
