import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
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
  
  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const timePeriod = parseInt(req.query.timePeriod as string) || 30;
      const dashboardData = await storage.getDashboardData(timePeriod);
      res.json(dashboardData);
    } catch (error: any) {
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

  const httpServer = createServer(app);

  return httpServer;
}
