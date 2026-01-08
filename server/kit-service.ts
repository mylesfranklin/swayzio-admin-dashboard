const KIT_API_BASE = 'https://api.kit.com/v4';

function getApiKey(): string {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    throw new Error('KIT_API_KEY environment variable is not set');
  }
  return apiKey;
}

async function kitFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const apiKey = getApiKey();
  const url = `${KIT_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kit API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export interface KitGrowthStats {
  cancellations: number;
  net_new_subscribers: number;
  new_subscribers: number;
  subscribers: number;
  starting: string;
  ending: string;
}

export interface KitEmailStats {
  sent: number;
  clicked: number;
  opened: number;
  email_stats_mode: string;
  open_tracking_enabled: boolean;
  click_tracking_enabled: boolean;
  starting: string;
  ending: string;
}

export interface KitBroadcast {
  id: number;
  publication_id: number;
  created_at: string;
  subject: string;
  preview_text: string | null;
  description: string | null;
  public: boolean;
  published_at: string | null;
  send_at: string | null;
  email_address: string;
  email_template: {
    id: number;
    name: string;
  } | null;
}

export interface KitForm {
  id: number;
  name: string;
  created_at: string;
  type: string;
  format: string | null;
  embed_url: string;
  archived: boolean;
  uid: string;
}

export interface KitTag {
  id: number;
  name: string;
  created_at: string;
}

export interface KitSubscriber {
  id: number;
  first_name: string | null;
  email_address: string;
  state: string;
  created_at: string;
  fields: Record<string, any>;
}

export interface KitDashboardStats {
  growthStats: KitGrowthStats;
  emailStats: KitEmailStats;
  totalSubscribers: number;
  broadcasts: KitBroadcast[];
  forms: KitForm[];
  tags: KitTag[];
  recentSubscribers: KitSubscriber[];
}

class KitService {
  async getGrowthStats(starting?: string, ending?: string): Promise<KitGrowthStats> {
    try {
      const params = new URLSearchParams();
      if (starting) params.append('starting', starting);
      if (ending) params.append('ending', ending);
      
      const queryString = params.toString();
      const data = await kitFetch(`/account/growth_stats${queryString ? `?${queryString}` : ''}`);
      return data.stats;
    } catch (error: any) {
      console.error('Error fetching Kit growth stats:', error.message);
      throw error;
    }
  }

  async getEmailStats(): Promise<KitEmailStats> {
    try {
      const data = await kitFetch('/account/email_stats');
      return data.stats;
    } catch (error: any) {
      console.error('Error fetching Kit email stats:', error.message);
      throw error;
    }
  }

  async getSubscribers(options: { 
    status?: string; 
    per_page?: number;
    include_total_count?: boolean;
  } = {}): Promise<{ subscribers: KitSubscriber[]; total_count?: number }> {
    try {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.per_page) params.append('per_page', options.per_page.toString());
      if (options.include_total_count) params.append('include_total_count', 'true');
      
      const queryString = params.toString();
      const data = await kitFetch(`/subscribers${queryString ? `?${queryString}` : ''}`);
      return {
        subscribers: data.subscribers,
        total_count: data.pagination?.total_count
      };
    } catch (error: any) {
      console.error('Error fetching Kit subscribers:', error.message);
      throw error;
    }
  }

  async getBroadcasts(per_page: number = 20): Promise<KitBroadcast[]> {
    try {
      const data = await kitFetch(`/broadcasts?per_page=${per_page}`);
      return data.broadcasts;
    } catch (error: any) {
      console.error('Error fetching Kit broadcasts:', error.message);
      throw error;
    }
  }

  async getForms(): Promise<KitForm[]> {
    try {
      const data = await kitFetch('/forms');
      return data.forms;
    } catch (error: any) {
      console.error('Error fetching Kit forms:', error.message);
      throw error;
    }
  }

  async getTags(): Promise<KitTag[]> {
    try {
      const data = await kitFetch('/tags');
      return data.tags;
    } catch (error: any) {
      console.error('Error fetching Kit tags:', error.message);
      throw error;
    }
  }

  async getSubscriberGrowthHistory(months: number = 12): Promise<Array<{ month: string; newSubscribers: number; totalSubscribers: number }>> {
    try {
      const history: Array<{ month: string; newSubscribers: number; totalSubscribers: number }> = [];
      const now = new Date();
      
      // Get total current subscribers
      const subscribersData = await this.getSubscribers({ status: 'active', per_page: 1, include_total_count: true });
      const currentTotal = subscribersData.total_count || 0;
      
      // Fetch subscribers created in the past 12 months with pagination
      const monthCounts: Record<string, number> = {};
      let cursor: string | undefined;
      let hasMore = true;
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - months);
      
      // Paginate through all subscribers to count by month
      // Limit to 10 pages to avoid timeout (1000 subscribers per page max)
      let pageCount = 0;
      const maxPages = 20;
      
      while (hasMore && pageCount < maxPages) {
        const params = new URLSearchParams({
          per_page: '500'
        });
        if (cursor) {
          params.append('after', cursor);
        }
        
        const data = await kitFetch(`/subscribers?${params.toString()}`);
        const subscribers = data.subscribers || [];
        
        for (const sub of subscribers) {
          const createdAt = new Date(sub.created_at);
          if (createdAt < twelveMonthsAgo) {
            hasMore = false;
            break;
          }
          const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        }
        
        hasMore = hasMore && data.pagination?.has_next_page;
        cursor = data.pagination?.end_cursor;
        pageCount++;
      }
      
      // Build monthly history array
      let runningTotal = currentTotal;
      for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const newSubs = monthCounts[monthKey] || 0;
        
        history.unshift({
          month: monthLabel,
          newSubscribers: newSubs,
          totalSubscribers: runningTotal
        });
        
        // Subtract for previous month's total
        runningTotal -= newSubs;
      }
      
      return history;
    } catch (error: any) {
      console.error('Error fetching Kit subscriber growth history:', error.message);
      throw error;
    }
  }

  async getDashboardStats(): Promise<KitDashboardStats> {
    try {
      const [growthStats, emailStats, subscribersData, broadcasts, forms, tags] = await Promise.all([
        this.getGrowthStats(),
        this.getEmailStats(),
        this.getSubscribers({ status: 'active', per_page: 10, include_total_count: true }),
        this.getBroadcasts(15),
        this.getForms(),
        this.getTags()
      ]);

      return {
        growthStats,
        emailStats,
        totalSubscribers: subscribersData.total_count || growthStats.subscribers,
        broadcasts,
        forms,
        tags,
        recentSubscribers: subscribersData.subscribers
      };
    } catch (error: any) {
      console.error('Error fetching Kit dashboard stats:', error.message);
      throw error;
    }
  }

  isConnected(): boolean {
    try {
      getApiKey();
      return true;
    } catch {
      return false;
    }
  }
}

export const kitService = new KitService();
