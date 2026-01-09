import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hubspotService } from "./hubspot-service";
import { stripeService, getStripePublishableKey } from "./stripe-service";
import { mercuryService } from "./mercury-service";
import { kitService } from "./kit-service";
import { cacheManager } from "./cache-manager";

const CACHE_TTL_MINUTES = 7 * 60;
const KIT_CACHE_TTL_MINUTES = 7 * 60;

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== HubSpot Live API Routes =====
  
  app.get("/api/hubspot/live/contacts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const contacts = await hubspotService.getContacts(limit);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hubspot/live/companies", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const companies = await hubspotService.getCompanies(limit);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hubspot/live/deals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const deals = await hubspotService.getDeals(limit);
      res.json(deals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hubspot/live/dashboard", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      
      if (forceRefresh) {
        await cacheManager.invalidate('hubspot', 'dashboard');
      }
      
      const result = await cacheManager.getOrFetch(
        'hubspot',
        'dashboard',
        () => hubspotService.getDashboardStats(),
        CACHE_TTL_MINUTES
      );
      
      res.json({
        ...result.data,
        _cache: {
          lastUpdated: result.lastUpdated,
          isStale: result.isStale,
          fromCache: result.fromCache
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hubspot/live/music-catalog", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      
      if (forceRefresh) {
        await cacheManager.invalidate('hubspot', 'music-catalog');
      }
      
      const result = await cacheManager.getOrFetch(
        'hubspot',
        'music-catalog',
        () => hubspotService.getMusicCatalogDashboard(),
        CACHE_TTL_MINUTES
      );
      
      res.json({
        ...result.data,
        _cache: {
          lastUpdated: result.lastUpdated,
          isStale: result.isStale,
          fromCache: result.fromCache
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hubspot/live/status", async (req, res) => {
    try {
      const connected = await hubspotService.isConnected();
      res.json({ connected });
    } catch (error: any) {
      res.json({ connected: false, error: error.message });
    }
  });

  app.get("/api/hubspot/live/properties", async (req, res) => {
    try {
      const properties = await hubspotService.getContactProperties();
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Stripe Live API Routes =====
  
  app.get("/api/stripe/live/customers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const customers = await stripeService.getCustomers(limit);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/subscriptions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const subscriptions = await stripeService.getSubscriptions(limit);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/payments", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const payments = await stripeService.getPaymentIntents(limit);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/invoices", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const invoices = await stripeService.getInvoices(limit);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/charges", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const charges = await stripeService.getCharges(limit);
      res.json(charges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/balance-transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const transactions = await stripeService.getBalanceTransactions(limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/products", async (req, res) => {
    try {
      const products = await stripeService.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/prices", async (req, res) => {
    try {
      const prices = await stripeService.getPrices();
      res.json(prices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/dashboard", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      
      if (forceRefresh) {
        await cacheManager.invalidate('stripe', 'dashboard');
      }
      
      const result = await cacheManager.getOrFetch(
        'stripe',
        'dashboard',
        () => stripeService.getDashboardStats(),
        CACHE_TTL_MINUTES
      );
      
      res.json({
        ...result.data,
        _cache: {
          lastUpdated: result.lastUpdated,
          isStale: result.isStale,
          fromCache: result.fromCache
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stripe/live/status", async (req, res) => {
    try {
      const connected = await stripeService.isConnected();
      res.json({ connected });
    } catch (error: any) {
      res.json({ connected: false, error: error.message });
    }
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Mercury Live API Routes =====

  app.get("/api/mercury/live/accounts", async (req, res) => {
    try {
      const accounts = await mercuryService.getAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/mercury/live/transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const transactions = await mercuryService.getAllTransactions(limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/mercury/live/dashboard", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      
      if (forceRefresh) {
        await cacheManager.invalidate('mercury', 'dashboard');
      }
      
      const result = await cacheManager.getOrFetch(
        'mercury',
        'dashboard',
        () => mercuryService.getDashboardStats(),
        CACHE_TTL_MINUTES
      );
      
      res.json({
        ...result.data,
        _cache: {
          lastUpdated: result.lastUpdated,
          isStale: result.isStale,
          fromCache: result.fromCache
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/mercury/live/status", async (req, res) => {
    try {
      const connected = mercuryService.isConnected();
      res.json({ connected });
    } catch (error: any) {
      res.json({ connected: false, error: error.message });
    }
  });

  // ===== Kit Newsletter Live API Routes =====

  app.get("/api/kit/live/dashboard", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      
      if (forceRefresh) {
        await cacheManager.invalidate('kit', 'dashboard');
      }
      
      const result = await cacheManager.getOrFetch(
        'kit',
        'dashboard',
        () => kitService.getDashboardStats(),
        KIT_CACHE_TTL_MINUTES
      );
      
      res.json({
        ...result.data,
        _cache: {
          lastUpdated: result.lastUpdated,
          isStale: result.isStale,
          fromCache: result.fromCache
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/kit/live/subscribers", async (req, res) => {
    try {
      const status = req.query.status as string || 'active';
      const per_page = parseInt(req.query.per_page as string) || 100;
      const data = await kitService.getSubscribers({ status, per_page, include_total_count: true });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/kit/live/broadcasts", async (req, res) => {
    try {
      const per_page = parseInt(req.query.per_page as string) || 20;
      const broadcasts = await kitService.getBroadcasts(per_page);
      res.json(broadcasts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/kit/live/forms", async (req, res) => {
    try {
      const forms = await kitService.getForms();
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/kit/live/tags", async (req, res) => {
    try {
      const tags = await kitService.getTags();
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/kit/live/status", async (req, res) => {
    try {
      const connected = kitService.isConnected();
      res.json({ connected });
    } catch (error: any) {
      res.json({ connected: false, error: error.message });
    }
  });

  app.get("/api/kit/live/growth-history", async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const forceRefresh = req.query.refresh === 'true';
      
      if (forceRefresh) {
        await cacheManager.invalidate('kit', 'growth-history');
      }
      
      const result = await cacheManager.getOrFetch(
        'kit',
        'growth-history',
        () => kitService.getSubscriberGrowthHistory(months),
        KIT_CACHE_TTL_MINUTES
      );
      
      res.json(result.data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // SEO Analytics endpoint
  app.get("/api/seo/analytics", async (req, res) => {
    try {
      const domain = req.query.domain as string || "syncmoney.ai";
      const data = await storage.getSeoAnalytics(domain);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  // ===== Customer Routes =====
  
  // Get all customers
  app.get("/api/customers", async (req, res) => {
    try {
      const search = req.query.search as string;
      const customers = await storage.getCustomers(search);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get customer by ID
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomerById(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new customer
  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update a customer
  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.updateCustomer(parseInt(req.params.id), req.body);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sync a customer
  app.post("/api/customers/:id/sync", async (req, res) => {
    try {
      const result = await storage.syncCustomer(parseInt(req.params.id));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get customer activities
  app.get("/api/customers/:id/activities", async (req, res) => {
    try {
      const activities = await storage.getCustomerActivities(parseInt(req.params.id));
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get customer subscriptions
  app.get("/api/customers/:id/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getCustomerSubscriptions(parseInt(req.params.id));
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get customer invoices
  app.get("/api/customers/:id/invoices", async (req, res) => {
    try {
      const invoices = await storage.getCustomerInvoices(parseInt(req.params.id));
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== HubSpot Integration Routes =====
  
  // Get HubSpot integration status and config
  app.get("/api/integrations/hubspot", async (req, res) => {
    try {
      const config = await storage.getHubSpotConfig();
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Connect to HubSpot
  app.post("/api/integrations/hubspot/connect", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ message: "API key is required" });
      }
      const result = await storage.connectHubSpot(apiKey);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update HubSpot integration
  app.patch("/api/integrations/hubspot/update", async (req, res) => {
    try {
      const result = await storage.updateHubSpotConfig(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Disconnect from HubSpot
  app.delete("/api/integrations/hubspot/disconnect", async (req, res) => {
    try {
      const result = await storage.disconnectHubSpot();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Start HubSpot sync
  app.post("/api/integrations/hubspot/sync", async (req, res) => {
    try {
      const result = await storage.syncHubSpot();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get HubSpot contacts
  app.get("/api/hubspot/contacts", async (req, res) => {
    try {
      const contacts = await storage.getHubSpotContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Stripe Integration Routes =====
  
  // Get Stripe integration status and config
  app.get("/api/integrations/stripe", async (req, res) => {
    try {
      const config = await storage.getStripeConfig();
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Connect to Stripe
  app.post("/api/integrations/stripe/connect", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ message: "API key is required" });
      }
      const result = await storage.connectStripe(apiKey);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update Stripe integration
  app.patch("/api/integrations/stripe/update", async (req, res) => {
    try {
      const result = await storage.updateStripeConfig(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Disconnect from Stripe
  app.delete("/api/integrations/stripe/disconnect", async (req, res) => {
    try {
      const result = await storage.disconnectStripe();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Start Stripe sync
  app.post("/api/integrations/stripe/sync", async (req, res) => {
    try {
      const result = await storage.syncStripe();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Sync Routes =====
  
  // Start a sync job
  app.post("/api/sync", async (req, res) => {
    try {
      const syncOptions = req.body;
      const result = await storage.startSync(syncOptions);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get sync events
  app.get("/api/sync-events", async (req, res) => {
    try {
      const filter = req.query.filter as string;
      const events = await storage.getSyncEvents(filter);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get sync configuration
  app.get("/api/sync/config", async (req, res) => {
    try {
      const config = await storage.getSyncConfig();
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update sync configuration
  app.patch("/api/sync/config", async (req, res) => {
    try {
      const result = await storage.updateSyncConfig(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Dashboard Routes =====
  
  // Get dashboard data (legacy mock endpoint)
  app.get("/api/dashboard", async (req, res) => {
    try {
      const timePeriod = parseInt(req.query.timePeriod as string) || 30;
      const dashboardData = await storage.getDashboardData(timePeriod);
      res.json(dashboardData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get live dashboard data aggregated from all integrations (cached)
  app.get("/api/dashboard/live", async (req, res) => {
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        cacheManager.getOrFetch('stripe', 'dashboard', () => stripeService.getDashboardStats(), CACHE_TTL_MINUTES),
        cacheManager.getOrFetch('hubspot', 'music-catalog', () => hubspotService.getMusicCatalogDashboard(), CACHE_TTL_MINUTES),
        cacheManager.getOrFetch('kit', 'dashboard', () => kitService.getDashboardStats(), KIT_CACHE_TTL_MINUTES),
        cacheManager.getOrFetch('mercury', 'dashboard', () => mercuryService.getDashboardStats(), CACHE_TTL_MINUTES)
      ]);

      const stripeResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const hubspotResult = results[1].status === 'fulfilled' ? results[1].value : null;
      const kitResult = results[2].status === 'fulfilled' ? results[2].value : null;
      const mercuryResult = results[3].status === 'fulfilled' ? results[3].value : null;

      const stripeData = stripeResult?.data;
      const hubspotData = hubspotResult?.data;
      const kitData = kitResult?.data;
      const mercuryData = mercuryResult?.data;

      // Build KPI metrics from live data
      const totalCustomers = stripeData?.totalCustomers || 0;
      const connectedCustomers = hubspotData?.totalUsers || 0;
      const totalRevenue = stripeData?.totalRevenue || 0;
      const activeSubscriptions = stripeData?.activeSubscriptions || 0;
      const mrr = stripeData?.mrr || 0;
      const totalSubscribers = kitData?.totalSubscribers || 0;
      const bankBalance = mercuryData?.totalBalance || 0;

      // Transform revenue data for chart (last 12 months from Stripe)
      const revenueData = (stripeData?.revenueByMonth || []).map((item: any) => ({
        name: item.month,
        total: item.revenue,
        recurring: Math.round(item.revenue * 0.85) // Estimate recurring as 85% of total
      }));

      // Transform subscription plan data for pie chart
      const subscriptionsByPlan = stripeData?.subscriptionsByPlan || {};
      const subscriptionData = Object.entries(subscriptionsByPlan)
        .map(([name, value]) => ({
          name: name || 'Unknown Plan',
          value: value as number
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 plans

      // Build recent activity from Stripe payments and invoices
      const recentActivity: any[] = [];
      
      // Add recent payments
      const recentPayments = stripeData?.recentPayments || [];
      recentPayments.slice(0, 5).forEach((payment: any, index: number) => {
        recentActivity.push({
          id: payment.id || `payment-${index}`,
          customerId: payment.customerId || '',
          customerName: payment.customerEmail?.split('@')[0] || 'Customer',
          customerEmail: payment.customerEmail || '',
          type: payment.status === 'succeeded' ? 'Payment Successful' : 'Payment Failed',
          timestamp: new Date(payment.created * 1000).toISOString(),
          details: `Payment of $${(payment.amount / 100).toFixed(2)} ${payment.currency?.toUpperCase() || 'USD'}`
        });
      });

      // Add recent invoices
      const recentInvoices = stripeData?.recentInvoices || [];
      recentInvoices.slice(0, 5).forEach((invoice: any, index: number) => {
        recentActivity.push({
          id: invoice.id || `invoice-${index}`,
          customerId: invoice.customerId || '',
          customerName: invoice.customerEmail?.split('@')[0] || 'Customer',
          customerEmail: invoice.customerEmail || '',
          type: invoice.paid ? 'Invoice Paid' : 'Invoice Created',
          timestamp: new Date(invoice.created * 1000).toISOString(),
          details: `Invoice ${invoice.number || ''} for $${(invoice.amountDue / 100).toFixed(2)}`
        });
      });

      // Sort by timestamp and take most recent
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Cache status info
      const cacheStatus = {
        stripe: { 
          cached: stripeResult?.fromCache ?? false,
          stale: stripeResult?.isStale ?? false,
          updatedAt: stripeResult?.lastUpdated?.toISOString() ?? null
        },
        hubspot: {
          cached: hubspotResult?.fromCache ?? false,
          stale: hubspotResult?.isStale ?? false,
          updatedAt: hubspotResult?.lastUpdated?.toISOString() ?? null
        },
        kit: {
          cached: kitResult?.fromCache ?? false,
          stale: kitResult?.isStale ?? false,
          updatedAt: kitResult?.lastUpdated?.toISOString() ?? null
        },
        mercury: {
          cached: mercuryResult?.fromCache ?? false,
          stale: mercuryResult?.isStale ?? false,
          updatedAt: mercuryResult?.lastUpdated?.toISOString() ?? null
        }
      };

      res.json({
        // KPI metrics
        totalCustomers,
        connectedCustomers,
        totalRevenue,
        activeSubscriptions,
        mrr,
        totalSubscribers,
        bankBalance,
        
        // Chart data
        revenueData,
        subscriptionData,
        
        // Activity feed
        recentActivity: recentActivity.slice(0, 10),
        
        // Cache info
        cacheStatus,
        
        // Raw data for additional uses
        hubspot: hubspotData ? {
          totalContacts: hubspotData.totalContacts,
          subscribedUsers: hubspotData.subscribedUsers,
          taggedTracks: hubspotData.totalTaggedTracks,
          untaggedTracks: hubspotData.totalUntaggedTracks
        } : null,
        kit: kitData ? {
          totalSubscribers: kitData.totalSubscribers,
          averageOpenRate: kitData.averageOpenRate,
          averageClickRate: kitData.averageClickRate
        } : null
      });
    } catch (error: any) {
      console.error('Error fetching live dashboard:', error.message);
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Settings Routes =====
  
  // Get application settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update application settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Social Media Routes =====
  
  // Get social media data
  app.get("/api/social/data", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as string;
      const platform = req.query.platform as string;
      const data = await storage.getSocialMediaData(timeframe, platform);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get social media posts
  app.get("/api/social/posts", async (req, res) => {
    try {
      const platform = req.query.platform as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getSocialPosts(platform, limit);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get social media ad campaigns
  app.get("/api/social/campaigns", async (req, res) => {
    try {
      const status = req.query.status as string;
      const campaigns = await storage.getSocialAdCampaigns(status);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create social media post
  app.post("/api/social/posts", async (req, res) => {
    try {
      const result = await storage.createSocialPost(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update social media post
  app.patch("/api/social/posts/:id", async (req, res) => {
    try {
      const result = await storage.updateSocialPost(req.params.id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete social media post
  app.delete("/api/social/posts/:id", async (req, res) => {
    try {
      const result = await storage.deleteSocialPost(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Webhook Routes =====
  
  // HubSpot webhook endpoint
  app.post("/api/webhooks/hubspot", async (req, res) => {
    try {
      await storage.handleHubSpotWebhook(req.body);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("HubSpot webhook error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe webhook endpoint
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      await storage.handleStripeWebhook(req.body);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Stripe webhook error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===== Stripe Payment Routes =====
  
  // Create a payment intent for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { amount, customerId } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }
      
      const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      };
      
      // Add customer ID if available
      if (customerId) {
        paymentIntentOptions.customer = customerId;
      }
      
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Create a subscription
  app.post('/api/create-subscription', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { customerId, priceId, email, name } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }
      
      let stripeCustomerId = customerId;
      
      // If no customer ID is provided but we have email, create a new customer
      if (!stripeCustomerId && email) {
        const customerData: Stripe.CustomerCreateParams = {
          email,
          metadata: {}
        };
        
        if (name) {
          customerData.name = name;
        }
        
        const customer = await stripe.customers.create(customerData);
        stripeCustomerId = customer.id;
      }
      
      if (!stripeCustomerId) {
        return res.status(400).json({ message: "Customer ID or email is required" });
      }
      
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Get the client secret from the payment intent
      let clientSecret = null;
      if (typeof subscription.latest_invoice !== 'string') {
        const paymentIntent = subscription.latest_invoice?.payment_intent;
        if (paymentIntent && typeof paymentIntent !== 'string') {
          clientSecret = paymentIntent.client_secret;
        }
      }
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret,
        customerId: stripeCustomerId
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Cancel a subscription
  app.post('/api/cancel-subscription', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { subscriptionId, cancelImmediately } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ message: "Subscription ID is required" });
      }
      
      let subscription;
      
      if (cancelImmediately) {
        // Cancel immediately
        subscription = await stripe.subscriptions.cancel(subscriptionId);
      } else {
        // Cancel at period end
        subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }
      
      res.json({ subscription });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Cache Management Endpoints =====
  
  app.post("/api/cache/refresh/:integration", async (req, res) => {
    try {
      const { integration } = req.params;
      const validIntegrations = ['hubspot', 'stripe', 'mercury', 'kit'];
      
      if (!validIntegrations.includes(integration)) {
        return res.status(400).json({ message: `Invalid integration: ${integration}` });
      }
      
      await cacheManager.invalidate(integration);
      
      let result;
      switch (integration) {
        case 'hubspot':
          result = await hubspotService.getMusicCatalogDashboard();
          await cacheManager.set('hubspot', 'music-catalog', result, CACHE_TTL_MINUTES);
          break;
        case 'stripe':
          result = await stripeService.getDashboardStats();
          await cacheManager.set('stripe', 'dashboard', result, CACHE_TTL_MINUTES);
          break;
        case 'mercury':
          result = await mercuryService.getDashboardStats();
          await cacheManager.set('mercury', 'dashboard', result, CACHE_TTL_MINUTES);
          break;
        case 'kit':
          result = await kitService.getDashboardStats();
          await cacheManager.set('kit', 'dashboard', result, KIT_CACHE_TTL_MINUTES);
          break;
      }
      
      res.json({ 
        success: true, 
        integration,
        message: `Cache refreshed for ${integration}`,
        lastUpdated: new Date()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cache/status", async (req, res) => {
    try {
      const integrations = ['hubspot', 'stripe', 'mercury', 'kit'];
      const status: Record<string, any> = {};
      
      for (const integration of integrations) {
        const syncState = await cacheManager.getSyncState(integration);
        let cacheKey = 'dashboard';
        if (integration === 'hubspot') cacheKey = 'music-catalog';
        
        const cached = await cacheManager.get(integration, cacheKey);
        
        status[integration] = {
          hasCachedData: !!cached,
          lastUpdated: cached?.lastUpdated || null,
          isStale: cached?.isStale || false,
          expiresAt: cached?.expiresAt || null,
          syncStatus: syncState?.syncStatus || 'idle'
        };
      }
      
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Register scheduled refreshers for background cache warming
  cacheManager.registerRefresher('hubspot', 'music-catalog', () => hubspotService.getMusicCatalogDashboard());
  cacheManager.registerRefresher('stripe', 'dashboard', () => stripeService.getDashboardStats());
  cacheManager.registerRefresher('mercury', 'dashboard', () => mercuryService.getDashboardStats());
  cacheManager.registerRefresher('kit', 'dashboard', () => kitService.getDashboardStats());
  
  // Start background refresh every 6 hours
  cacheManager.startBackgroundRefresh(6);

  const httpServer = createServer(app);

  return httpServer;
}
