import {
  users,
  type User,
  type InsertUser,
  customers,
  type Customer,
  type InsertCustomer,
  subscriptions,
  type Subscription,
  type InsertSubscription,
  activities,
  type Activity,
  type InsertActivity,
  invoices,
  type Invoice,
  type InsertInvoice,
  integrationConfigs,
  type IntegrationConfig,
  type InsertIntegrationConfig,
  syncEvents,
  type SyncEvent,
  type InsertSyncEvent
} from "@shared/schema";

// Import mock data generators for HubSpot and Stripe
import HubSpotService from "../client/src/services/hubspot-service";
import StripeService from "../client/src/services/stripe-service";

export interface IStorage {
  // Original user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer methods
  getCustomers(search?: string): Promise<Customer[]>;
  getCustomerById(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined>;
  syncCustomer(id: number): Promise<{ success: boolean }>;
  getCustomerActivities(id: number): Promise<Activity[]>;
  getCustomerSubscriptions(id: number): Promise<Subscription[]>;
  getCustomerInvoices(id: number): Promise<Invoice[]>;
  
  // HubSpot integration methods
  getHubSpotConfig(): Promise<any>;
  connectHubSpot(apiKey: string): Promise<any>;
  updateHubSpotConfig(config: any): Promise<any>;
  disconnectHubSpot(): Promise<any>;
  syncHubSpot(): Promise<any>;
  getHubSpotContacts(): Promise<any>;
  
  // Stripe integration methods
  getStripeConfig(): Promise<any>;
  connectStripe(apiKey: string): Promise<any>;
  updateStripeConfig(config: any): Promise<any>;
  disconnectStripe(): Promise<any>;
  syncStripe(): Promise<any>;
  
  // Sync methods
  startSync(options?: any): Promise<any>;
  getSyncEvents(filter?: string): Promise<SyncEvent[]>;
  getSyncConfig(): Promise<any>;
  updateSyncConfig(config: any): Promise<any>;
  
  // Dashboard methods
  getDashboardData(timePeriod: number): Promise<any>;
  
  // Settings methods
  getSettings(): Promise<any>;
  updateSettings(settings: any): Promise<any>;
  
  // Social media methods
  getSocialMediaData(timeframe?: string, platform?: string): Promise<any>;
  getSocialPosts(platform?: string, limit?: number): Promise<any>;
  getSocialAdCampaigns(status?: string): Promise<any>;
  createSocialPost(data: any): Promise<any>;
  updateSocialPost(id: string, data: any): Promise<any>;
  deleteSocialPost(id: string): Promise<any>;
  
  // Webhook handling
  handleHubSpotWebhook(data: any): Promise<void>;
  handleStripeWebhook(data: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private subscriptions: Map<number, Subscription>;
  private activities: Map<number, Activity>;
  private invoices: Map<number, Invoice>;
  private integrationConfig: any;
  private syncEvents: SyncEvent[];
  private settings: any;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.subscriptions = new Map();
    this.activities = new Map();
    this.invoices = new Map();
    this.syncEvents = [];
    this.currentId = 1;
    
    // Initialize with default integration config
    this.integrationConfig = {
      hubspot: {
        isConnected: false,
        apiKey: "",
        baseUrl: "https://api.hubapi.com",
        portalId: "",
        autoSync: true,
        syncFrequency: 30,
        lastSynced: null,
        webhookEnabled: false
      },
      stripe: {
        isConnected: false,
        apiKey: "",
        baseUrl: "https://api.stripe.com",
        accountId: "",
        currency: "usd",
        autoSync: true,
        syncFrequency: 30,
        lastSynced: null,
        webhookEnabled: false,
        webhookSecret: ""
      }
    };
    
    // Initialize with default settings
    this.settings = {
      applicationName: "Swayzio Admin",
      dateFormat: "MM/dd/yyyy",
      timeFormat: "12h",
      timezone: "UTC",
      defaultCurrency: "USD",
      autoSync: true,
      syncFrequency: 30,
      conflictResolution: "hubspot",
      emailNotifications: true,
      syncFailures: true,
      newCustomers: true,
      paymentFailures: true,
      subscriptionChanges: true,
      emailAddress: "admin@example.com"
    };
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample customers
    const sampleCustomers: Customer[] = [
      {
        id: 1,
        hubspotId: "1",
        stripeId: "cus_abc123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        company: "Acme Inc",
        createdAt: new Date("2023-01-15T08:30:00Z"),
        lastModified: new Date("2023-09-28T14:22:00Z"),
        stage: "customer",
        status: "Closed Won",
        address: {
          line1: "123 Main St",
          city: "Anytown",
          state: "CA",
          postalCode: "94107",
          country: "US"
        },
        metadata: {
          industry: "Technology",
          source: "Website",
          employees: "50"
        }
      },
      {
        id: 2,
        hubspotId: "2",
        stripeId: "cus_def456",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "(555) 987-6543",
        company: "XYZ Corp",
        createdAt: new Date("2023-03-22T10:15:00Z"),
        lastModified: new Date("2023-10-01T09:45:00Z"),
        stage: "opportunity",
        status: "In Progress",
        address: {
          line1: "456 Oak St",
          city: "Somewhere",
          state: "NY",
          postalCode: "10001",
          country: "US"
        },
        metadata: {
          industry: "Manufacturing",
          source: "Referral",
          employees: "120"
        }
      },
      {
        id: 3,
        hubspotId: "3",
        stripeId: "cus_ghi789",
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert.johnson@example.com",
        phone: "(555) 456-7890",
        company: "Johnson & Co",
        createdAt: new Date("2023-06-05T15:40:00Z"),
        lastModified: new Date("2023-09-29T16:30:00Z"),
        stage: "customer",
        status: "Closed Won",
        address: null,
        metadata: {
          industry: "Consulting",
          source: "Conference",
          employees: "15"
        }
      },
      {
        id: 4,
        hubspotId: "4",
        stripeId: null,
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        phone: "(555) 789-0123",
        company: "Williams Tech",
        createdAt: new Date("2023-07-18T11:20:00Z"),
        lastModified: new Date("2023-09-25T13:10:00Z"),
        stage: "lead",
        status: "New",
        address: null,
        metadata: {
          industry: "Education",
          source: "Social Media",
          employees: "5"
        }
      },
      {
        id: 5,
        hubspotId: null,
        stripeId: "cus_jkl012",
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@example.com",
        phone: "(555) 321-0987",
        company: "Brown Industries",
        createdAt: new Date("2023-08-30T09:05:00Z"),
        lastModified: new Date("2023-10-02T10:55:00Z"),
        stage: "marketingqualifiedlead",
        status: "In Progress",
        address: {
          line1: "789 Pine St",
          city: "Elsewhere",
          state: "TX",
          postalCode: "75001",
          country: "US"
        },
        metadata: {
          industry: "Healthcare",
          source: "Advertisement",
          employees: "75"
        }
      }
    ];

    // Add sample customers
    sampleCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });

    // Sample activities
    const sampleActivities: Activity[] = [
      {
        id: 1,
        activityId: "act1",
        contactId: "1",
        type: "EMAIL",
        timestamp: new Date("2023-09-28T14:20:00Z"),
        title: "Email Sent: September Newsletter",
        details: {
          subject: "September Newsletter",
          status: "SENT",
          openedAt: "2023-09-28T15:05:00Z",
          clickedAt: "2023-09-28T15:10:00Z"
        },
        userId: "user1",
        properties: null
      },
      {
        id: 2,
        activityId: "act2",
        contactId: "1",
        type: "MEETING",
        timestamp: new Date("2023-09-15T10:00:00Z"),
        title: "Meeting: Product Demo",
        details: {
          duration: 60,
          outcome: "Positive",
          notes: "Client was interested in enterprise package"
        },
        userId: "user1",
        properties: null
      },
      {
        id: 3,
        activityId: "act3",
        contactId: "1",
        type: "TASK",
        timestamp: new Date("2023-09-05T09:30:00Z"),
        title: "Task Completed: Follow-up Call",
        details: {
          status: "COMPLETED",
          assignedTo: "Sales Rep",
          notes: "Discussed upcoming product needs"
        },
        userId: "user2",
        properties: null
      },
      {
        id: 4,
        activityId: "act6",
        contactId: "2",
        type: "MEETING",
        timestamp: new Date("2023-10-01T09:30:00Z"),
        title: "Meeting: Initial Consultation",
        details: {
          duration: 45,
          outcome: "Positive",
          notes: "Discussed requirements and provided product overview"
        },
        userId: "user1",
        properties: null
      },
      {
        id: 5,
        activityId: "act7",
        contactId: "2",
        type: "EMAIL",
        timestamp: new Date("2023-09-25T14:10:00Z"),
        title: "Email Sent: Proposal",
        details: {
          subject: "XYZ Corp - Custom Solution Proposal",
          status: "SENT",
          openedAt: "2023-09-25T15:30:00Z"
        },
        userId: "user3",
        properties: null
      }
    ];

    // Add sample activities
    sampleActivities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });

    // Sample subscriptions
    const sampleSubscriptions: Subscription[] = [
      {
        id: 1,
        stripeId: "sub_xyz123",
        customerId: "cus_abc123",
        status: "active",
        created: new Date("2023-01-20"),
        currentPeriodStart: new Date("2023-10-01"),
        currentPeriodEnd: new Date("2023-10-31"),
        plan: {
          id: "price_xyz123",
          nickname: "Enterprise Plan",
          amount: 39900,
          currency: "usd",
          interval: "month",
          intervalCount: 1
        },
        quantity: 1,
        cancelAtPeriodEnd: false,
        collectionMethod: "charge_automatically",
        defaultPaymentMethod: "card_xyz789",
        latestInvoice: "in_latest123",
        metadata: {
          seats: "10"
        }
      },
      {
        id: 2,
        stripeId: "sub_abc456",
        customerId: "cus_def456",
        status: "active",
        created: new Date("2023-03-25"),
        currentPeriodStart: new Date("2023-10-01"),
        currentPeriodEnd: new Date("2023-10-31"),
        plan: {
          id: "price_abc456",
          nickname: "Premium Plan",
          amount: 19900,
          currency: "usd",
          interval: "month",
          intervalCount: 1
        },
        quantity: 1,
        cancelAtPeriodEnd: false,
        collectionMethod: "charge_automatically",
        defaultPaymentMethod: "card_abc123",
        latestInvoice: "in_latest456",
        metadata: {
          seats: "5"
        }
      }
    ];

    // Add sample subscriptions
    sampleSubscriptions.forEach(subscription => {
      this.subscriptions.set(subscription.id, subscription);
    });

    // Sample invoices
    const sampleInvoices: Invoice[] = [
      {
        id: 1,
        invoiceId: "in_xyz123",
        customer: "cus_abc123",
        status: "paid",
        created: new Date("2023-10-01"),
        dueDate: new Date("2023-10-01"),
        amountDue: 39900,
        amountPaid: 39900,
        amountRemaining: 0,
        currency: "usd",
        number: "INV-001",
        paid: true,
        periodStart: new Date("2023-09-01"),
        periodEnd: new Date("2023-09-30"),
        lines: [
          {
            description: "Enterprise Plan - Oct 2023",
            amount: 39900,
            currency: "usd",
            period: {
              start: new Date("2023-09-01"),
              end: new Date("2023-09-30")
            }
          }
        ],
        paymentIntent: "pi_xyz123",
        subscription: "sub_xyz123",
        metadata: null
      },
      {
        id: 2,
        invoiceId: "in_xyz456",
        customer: "cus_abc123",
        status: "paid",
        created: new Date("2023-09-01"),
        dueDate: new Date("2023-09-01"),
        amountDue: 39900,
        amountPaid: 39900,
        amountRemaining: 0,
        currency: "usd",
        number: "INV-002",
        paid: true,
        periodStart: new Date("2023-08-01"),
        periodEnd: new Date("2023-08-31"),
        lines: [
          {
            description: "Enterprise Plan - Sep 2023",
            amount: 39900,
            currency: "usd",
            period: {
              start: new Date("2023-08-01"),
              end: new Date("2023-08-31")
            }
          }
        ],
        paymentIntent: "pi_xyz456",
        subscription: "sub_xyz123",
        metadata: null
      },
      {
        id: 3,
        invoiceId: "in_abc123",
        customer: "cus_def456",
        status: "paid",
        created: new Date("2023-10-01"),
        dueDate: new Date("2023-10-01"),
        amountDue: 19900,
        amountPaid: 19900,
        amountRemaining: 0,
        currency: "usd",
        number: "INV-003",
        paid: true,
        periodStart: new Date("2023-09-01"),
        periodEnd: new Date("2023-09-30"),
        lines: [
          {
            description: "Premium Plan - Oct 2023",
            amount: 19900,
            currency: "usd",
            period: {
              start: new Date("2023-09-01"),
              end: new Date("2023-09-30")
            }
          }
        ],
        paymentIntent: "pi_abc123",
        subscription: "sub_abc456",
        metadata: null
      }
    ];

    // Add sample invoices
    sampleInvoices.forEach(invoice => {
      this.invoices.set(invoice.id, invoice);
    });

    // Sample sync events
    this.syncEvents = [
      {
        id: "sync1",
        eventId: "ev_123",
        timestamp: new Date("2023-10-02T10:15:00Z"),
        status: "success",
        customerIds: ["1", "2", "3"],
        fullSync: true,
        operations: [
          {
            type: "hubspot_to_stripe",
            status: "success",
            fields: ["firstName", "lastName", "email"]
          },
          {
            type: "stripe_to_hubspot",
            status: "success",
            fields: ["subscriptions", "invoices"]
          }
        ],
        errorCount: 0,
        errorMessage: null
      },
      {
        id: "sync2",
        eventId: "ev_124",
        timestamp: new Date("2023-10-01T14:30:00Z"),
        status: "partial",
        customerIds: ["4", "5"],
        fullSync: false,
        operations: [
          {
            type: "hubspot_to_stripe",
            status: "success",
            fields: ["firstName", "lastName", "email"]
          },
          {
            type: "stripe_to_hubspot",
            status: "error",
            fields: ["subscriptions"],
            error: "API rate limit exceeded"
          }
        ],
        errorCount: 1,
        errorMessage: "Some operations failed: API rate limit exceeded"
      },
      {
        id: "sync3",
        eventId: "ev_125",
        timestamp: new Date("2023-09-30T09:45:00Z"),
        status: "error",
        customerIds: null,
        fullSync: true,
        operations: [
          {
            type: "hubspot_to_stripe",
            status: "error",
            error: "Authentication error"
          }
        ],
        errorCount: 1,
        errorMessage: "HubSpot authentication failed: Invalid API key"
      }
    ];
  }

  // Original user methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Customer methods
  async getCustomers(search?: string): Promise<Customer[]> {
    let customers = Array.from(this.customers.values());
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.firstName.toLowerCase().includes(lowerSearch) ||
        customer.lastName.toLowerCase().includes(lowerSearch) ||
        customer.email.toLowerCase().includes(lowerSearch) ||
        (customer.company && customer.company.toLowerCase().includes(lowerSearch))
      );
    }
    
    return customers;
  }

  async getCustomerById(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const newCustomer: Customer = { 
      ...customer, 
      id, 
      createdAt: new Date(),
      lastModified: new Date()
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { 
      ...customer, 
      ...data, 
      lastModified: new Date() 
    };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async syncCustomer(id: number): Promise<{ success: boolean }> {
    const customer = this.customers.get(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    
    // In a real implementation, this would perform actual sync operations
    // For the demo, we'll just simulate a successful sync
    
    // Create a sync event for this operation
    const eventId = `ev_${Date.now()}`;
    const syncEvent: SyncEvent = {
      id: `sync_${Date.now()}`,
      eventId,
      timestamp: new Date(),
      status: "success",
      customerIds: [customer.id.toString()],
      fullSync: false,
      operations: [
        {
          type: customer.hubspotId ? "hubspot_to_stripe" : "stripe_to_hubspot",
          status: "success",
          fields: ["firstName", "lastName", "email", "phone", "company"]
        }
      ],
      errorCount: 0,
      errorMessage: null
    };
    
    this.syncEvents.unshift(syncEvent);
    
    return { success: true };
  }

  async getCustomerActivities(id: number): Promise<Activity[]> {
    const customer = this.customers.get(id);
    if (!customer || !customer.hubspotId) {
      return [];
    }
    
    return Array.from(this.activities.values())
      .filter(activity => activity.contactId === customer.hubspotId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getCustomerSubscriptions(id: number): Promise<Subscription[]> {
    const customer = this.customers.get(id);
    if (!customer || !customer.stripeId) {
      return [];
    }
    
    return Array.from(this.subscriptions.values())
      .filter(subscription => subscription.customerId === customer.stripeId)
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  async getCustomerInvoices(id: number): Promise<Invoice[]> {
    const customer = this.customers.get(id);
    if (!customer || !customer.stripeId) {
      return [];
    }
    
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.customer === customer.stripeId)
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  // HubSpot integration methods
  async getHubSpotConfig(): Promise<any> {
    return this.integrationConfig.hubspot;
  }

  async connectHubSpot(apiKey: string): Promise<any> {
    // In a real implementation, this would verify the API key with HubSpot
    // For the demo, we'll just simulate a successful connection
    
    this.integrationConfig.hubspot = {
      ...this.integrationConfig.hubspot,
      isConnected: true,
      apiKey,
      lastSynced: new Date(),
      portalId: "12345678"
    };
    
    return { success: true, config: this.integrationConfig.hubspot };
  }

  async updateHubSpotConfig(config: any): Promise<any> {
    this.integrationConfig.hubspot = {
      ...this.integrationConfig.hubspot,
      ...config
    };
    
    return { success: true, config: this.integrationConfig.hubspot };
  }

  async disconnectHubSpot(): Promise<any> {
    this.integrationConfig.hubspot = {
      ...this.integrationConfig.hubspot,
      isConnected: false,
      apiKey: ""
    };
    
    return { success: true };
  }

  async syncHubSpot(): Promise<any> {
    // In a real implementation, this would perform actual sync operations
    // For the demo, we'll just simulate a successful sync
    
    // Update last synced timestamp
    this.integrationConfig.hubspot.lastSynced = new Date();
    
    // Create a sync event for this operation
    const eventId = `ev_${Date.now()}`;
    const syncEvent: SyncEvent = {
      id: `sync_${Date.now()}`,
      eventId,
      timestamp: new Date(),
      status: "success",
      customerIds: null, // Full sync
      fullSync: true,
      operations: [
        {
          type: "hubspot_to_stripe",
          status: "success",
          fields: ["firstName", "lastName", "email", "phone", "company", "stage", "status"]
        }
      ],
      errorCount: 0,
      errorMessage: null
    };
    
    this.syncEvents.unshift(syncEvent);
    
    return { 
      success: true, 
      jobId: eventId,
      message: "HubSpot synchronization started successfully" 
    };
  }

  async getHubSpotContacts(): Promise<any> {
    // In a real implementation, this would fetch contacts from HubSpot
    // For the demo, we'll just return contacts from our storage that have a HubSpot ID
    
    const contacts = Array.from(this.customers.values())
      .filter(customer => customer.hubspotId)
      .map(customer => ({
        id: customer.hubspotId,
        properties: {
          firstname: customer.firstName,
          lastname: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          createdate: customer.createdAt.toISOString(),
          lastmodifieddate: customer.lastModified.toISOString(),
          lifecyclestage: customer.stage,
          hs_lead_status: customer.status
        }
      }));
    
    return {
      contacts,
      pagination: {
        count: contacts.length,
        hasMore: false,
        offset: 0
      }
    };
  }

  // Stripe integration methods
  async getStripeConfig(): Promise<any> {
    return this.integrationConfig.stripe;
  }

  async connectStripe(apiKey: string): Promise<any> {
    // In a real implementation, this would verify the API key with Stripe
    // For the demo, we'll just simulate a successful connection
    
    this.integrationConfig.stripe = {
      ...this.integrationConfig.stripe,
      isConnected: true,
      apiKey,
      lastSynced: new Date(),
      accountId: "acct_12345"
    };
    
    return { success: true, config: this.integrationConfig.stripe };
  }

  async updateStripeConfig(config: any): Promise<any> {
    this.integrationConfig.stripe = {
      ...this.integrationConfig.stripe,
      ...config
    };
    
    return { success: true, config: this.integrationConfig.stripe };
  }

  async disconnectStripe(): Promise<any> {
    this.integrationConfig.stripe = {
      ...this.integrationConfig.stripe,
      isConnected: false,
      apiKey: ""
    };
    
    return { success: true };
  }

  async syncStripe(): Promise<any> {
    // In a real implementation, this would perform actual sync operations
    // For the demo, we'll just simulate a successful sync
    
    // Update last synced timestamp
    this.integrationConfig.stripe.lastSynced = new Date();
    
    // Create a sync event for this operation
    const eventId = `ev_${Date.now()}`;
    const syncEvent: SyncEvent = {
      id: `sync_${Date.now()}`,
      eventId,
      timestamp: new Date(),
      status: "success",
      customerIds: null, // Full sync
      fullSync: true,
      operations: [
        {
          type: "stripe_to_hubspot",
          status: "success",
          fields: ["subscriptions", "invoices", "payment_methods", "address"]
        }
      ],
      errorCount: 0,
      errorMessage: null
    };
    
    this.syncEvents.unshift(syncEvent);
    
    return { 
      success: true, 
      jobId: eventId,
      message: "Stripe synchronization started successfully" 
    };
  }

  // Sync methods
  async startSync(options: any = {}): Promise<any> {
    // In a real implementation, this would start a synchronization job
    // For the demo, we'll just simulate a successful sync start
    
    const jobId = `job_${Date.now()}`;
    const syncType = options.type || "full";
    const customerIds = options.customerIds;
    
    // Create a sync event for this operation
    const eventId = `ev_${Date.now()}`;
    const syncEvent: SyncEvent = {
      id: `sync_${Date.now()}`,
      eventId,
      timestamp: new Date(),
      status: "success",
      customerIds: customerIds || null,
      fullSync: syncType === "full",
      operations: [
        {
          type: "hubspot_to_stripe",
          status: "success",
          fields: ["firstName", "lastName", "email", "phone", "company", "stage", "status"]
        },
        {
          type: "stripe_to_hubspot",
          status: "success",
          fields: ["subscriptions", "invoices", "payment_methods", "address"]
        }
      ],
      errorCount: 0,
      errorMessage: null
    };
    
    this.syncEvents.unshift(syncEvent);
    
    // Update last synced timestamps
    if (syncType === "full") {
      this.integrationConfig.hubspot.lastSynced = new Date();
      this.integrationConfig.stripe.lastSynced = new Date();
    }
    
    return { 
      success: true, 
      jobId,
      message: `${syncType === "full" ? "Full" : "Partial"} synchronization started successfully` 
    };
  }

  async getSyncEvents(filter: string = "all"): Promise<SyncEvent[]> {
    if (filter === "all") {
      return this.syncEvents;
    }
    
    return this.syncEvents.filter(event => event.status === filter);
  }

  async getSyncConfig(): Promise<any> {
    return {
      isEnabled: true,
      frequency: 30,
      fields: ["firstName", "lastName", "email", "phone", "company", "stage", "status", "subscriptions", "invoices"],
      primarySystems: {
        firstName: "hubspot",
        lastName: "hubspot",
        email: "hubspot",
        phone: "hubspot",
        company: "hubspot",
        stage: "hubspot",
        status: "hubspot",
        subscriptions: "stripe",
        invoices: "stripe"
      },
      lastSynced: this.syncEvents.length > 0 ? this.syncEvents[0].timestamp : null
    };
  }

  async updateSyncConfig(config: any): Promise<any> {
    // In a real implementation, this would update the sync configuration
    // For the demo, we'll just simulate a successful update
    
    return { success: true, config };
  }

  // Dashboard methods
  async getDashboardData(timePeriod: number): Promise<any> {
    // In a real implementation, this would calculate actual dashboard metrics
    // For the demo, we'll just return sample data
    
    return {
      totalCustomers: 5823,
      connectedCustomers: 3427,
      totalRevenue: 278492,
      activeSubscriptions: 2589,
      revenueData: [
        { name: "Jan", total: 24000, recurring: 18000 },
        { name: "Feb", total: 28000, recurring: 21000 },
        { name: "Mar", total: 30000, recurring: 24000 },
        { name: "Apr", total: 34000, recurring: 26000 },
        { name: "May", total: 38000, recurring: 29000 },
        { name: "Jun", total: 41000, recurring: 31000 },
        { name: "Jul", total: 44000, recurring: 34000 }
      ],
      subscriptionData: [
        { name: "Enterprise Plan", value: 35 },
        { name: "Premium Plan", value: 25 },
        { name: "Standard Plan", value: 20 },
        { name: "Basic Plan", value: 15 },
        { name: "Free Tier", value: 5 }
      ],
      recentActivities: Array.from(this.activities.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)
        .map(activity => {
          const customer = Array.from(this.customers.values())
            .find(c => c.hubspotId === activity.contactId);
          
          return {
            id: activity.id.toString(),
            customerId: customer?.id.toString() || "",
            customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Unknown",
            customerEmail: customer?.email || "",
            type: activity.type,
            timestamp: activity.timestamp.toISOString(),
            details: typeof activity.details === "string" 
              ? activity.details 
              : JSON.stringify(activity.details)
          };
        })
    };
  }

  // Settings methods
  async getSettings(): Promise<any> {
    return this.settings;
  }

  async updateSettings(settings: any): Promise<any> {
    this.settings = {
      ...this.settings,
      ...settings
    };
    
    return this.settings;
  }

  // Webhook handling
  async handleHubSpotWebhook(data: any): Promise<void> {
    // In a real implementation, this would process HubSpot webhook data
    console.log("Received HubSpot webhook:", data);
  }

  async handleStripeWebhook(data: any): Promise<void> {
    // In a real implementation, this would process Stripe webhook data
    console.log("Received Stripe webhook:", data);
  }
  
  // Social media methods
  async getSocialMediaData(timeframe: string = "30days", platform: string = "all"): Promise<any> {
    // This would typically fetch data from social media APIs
    // For now, return structured data that matches the UI requirements
    return {
      overview: {
        totalFollowers: 123500,
        followerGrowth: 3.2,
        totalEngagement: 45670,
        engagementRate: 2.8,
        totalReach: 789000,
        reachGrowth: 5.1,
        totalImpressions: 1245000,
        impressionGrowth: 4.3
      },
      platforms: {
        instagram: {
          followers: 50000,
          growth: 2.3,
          engagement: 12500,
          engagementRate: 3.1,
          posts: 245,
          avgLikes: 1200,
          avgComments: 85
        },
        twitter: {
          followers: 28500,
          growth: 1.5,
          engagement: 8700,
          engagementRate: 1.9,
          tweets: 420,
          avgLikes: 320,
          avgRetweets: 45
        },
        facebook: {
          followers: 32000,
          growth: 0.8,
          engagement: 9500,
          engagementRate: 1.2,
          posts: 180,
          avgLikes: 380,
          avgComments: 65
        },
        linkedin: {
          followers: 12500,
          growth: 4.2,
          engagement: 3200,
          engagementRate: 2.5,
          posts: 120,
          avgLikes: 250,
          avgComments: 38
        },
        youtube: {
          subscribers: 8500,
          growth: 5.7,
          views: 325000,
          avgViews: 5600,
          videos: 58,
          avgLikes: 420,
          avgComments: 75
        }
      },
      advertising: {
        totalSpend: 125000,
        roiPercentage: 324,
        impressions: 8500000,
        clicks: 185000,
        ctr: 2.17,
        cpc: 0.68,
        conversions: 12800,
        conversionRate: 6.9,
        platforms: {
          instagram: 42000,
          facebook: 35000,
          twitter: 18000,
          linkedin: 22000,
          google: 8000
        },
        monthly: [
          { month: "Jan", spend: 9500, roi: 31000, ctr: 2.1 },
          { month: "Feb", spend: 10200, roi: 33500, ctr: 2.2 },
          { month: "Mar", spend: 9800, roi: 32000, ctr: 2.0 },
          { month: "Apr", spend: 10500, roi: 34000, ctr: 2.1 },
          { month: "May", spend: 11200, roi: 36500, ctr: 2.2 },
          { month: "Jun", spend: 12000, roi: 39000, ctr: 2.3 },
          { month: "Jul", spend: 12500, roi: 40500, ctr: 2.3 },
          { month: "Aug", spend: 13000, roi: 42000, ctr: 2.2 },
          { month: "Sep", spend: 12800, roi: 41500, ctr: 2.1 },
          { month: "Oct", spend: 12000, roi: 39000, ctr: 2.0 },
          { month: "Nov", spend: 11500, roi: 37000, ctr: 2.1 },
        ]
      }
    };
  }

  async getSocialPosts(platform: string = "all", limit: number = 10): Promise<any> {
    // This would fetch posts from social media APIs
    // Returning representative data for development
    const allPosts = [
      { 
        id: "1", 
        platform: "instagram", 
        date: "2023-11-15", 
        type: "carousel", 
        engagement: 3245,
        engagementRate: 6.5,
        likes: 2850,
        comments: 395,
        shares: 450,
        saves: 230,
        impressions: 62000,
        content: "New product launch - SyncMoney Premium Card 💳"
      },
      { 
        id: "2", 
        platform: "twitter", 
        date: "2023-11-10", 
        type: "text", 
        engagement: 1550,
        engagementRate: 5.4,
        likes: 920,
        comments: 230,
        retweets: 400,
        impressions: 28500,
        content: "Exciting news! We've just reached 50K happy customers! Thank you for your support 🎉"
      },
      { 
        id: "3", 
        platform: "facebook", 
        date: "2023-11-05", 
        type: "video", 
        engagement: 2100,
        engagementRate: 6.5,
        likes: 1250,
        comments: 350,
        shares: 500,
        views: 32000,
        impressions: 45000,
        content: "How SyncMoney helps you save $500/month"
      },
      { 
        id: "4", 
        platform: "linkedin", 
        date: "2023-11-02", 
        type: "article", 
        engagement: 1850,
        engagementRate: 8.2,
        likes: 1200,
        comments: 150,
        shares: 500,
        impressions: 22500,
        content: "SyncMoney named as Top Financial Innovation of 2023"
      },
      { 
        id: "5", 
        platform: "youtube", 
        date: "2023-10-28", 
        type: "video", 
        engagement: 2800,
        engagementRate: 7.0,
        likes: 1800,
        comments: 320,
        shares: 680,
        views: 42000,
        impressions: 65000,
        content: "SyncMoney App Walkthrough - Complete Guide"
      }
    ];

    if (platform === "all") {
      return allPosts.slice(0, limit);
    } else {
      return allPosts.filter(post => post.platform === platform).slice(0, limit);
    }
  }

  async getSocialAdCampaigns(status: string = "all"): Promise<any> {
    // This would fetch ad campaigns from ad platforms
    // Returning representative data for the UI
    const allCampaigns = [
      {
        id: "1",
        name: "Holiday Special",
        platform: "instagram",
        status: "active",
        spend: 18500,
        impressions: 1250000,
        clicks: 36500,
        ctr: 2.92,
        cpc: 0.51,
        conversions: 3200,
        conversionRate: 8.8,
        roi: 54000
      },
      {
        id: "2",
        name: "App Install Campaign",
        platform: "facebook",
        status: "active",
        spend: 22000,
        impressions: 1650000,
        clicks: 42000,
        ctr: 2.55,
        cpc: 0.52,
        conversions: 3800,
        conversionRate: 9.0,
        roi: 65000
      },
      {
        id: "3",
        name: "Business Solutions",
        platform: "linkedin",
        status: "active",
        spend: 16500,
        impressions: 850000,
        clicks: 22000,
        ctr: 2.59,
        cpc: 0.75,
        conversions: 1800,
        conversionRate: 8.2,
        roi: 48000
      },
      {
        id: "4",
        name: "Retargeting Campaign",
        platform: "facebook",
        status: "paused",
        spend: 8500,
        impressions: 620000,
        clicks: 15000,
        ctr: 2.42,
        cpc: 0.57,
        conversions: 1200,
        conversionRate: 8.0,
        roi: 28000
      },
      {
        id: "5",
        name: "Brand Awareness",
        platform: "twitter",
        status: "completed",
        spend: 12000,
        impressions: 980000,
        clicks: 19500,
        ctr: 1.99,
        cpc: 0.62,
        conversions: 1100,
        conversionRate: 5.6,
        roi: 32000
      }
    ];

    if (status === "all") {
      return allCampaigns;
    } else {
      return allCampaigns.filter(campaign => campaign.status === status);
    }
  }

  async createSocialPost(data: any): Promise<any> {
    // In a real implementation, this would create a post via the social media API
    console.log("Creating social post:", data);
    return {
      id: Math.random().toString(36).substring(7),
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: "scheduled"
    };
  }

  async updateSocialPost(id: string, data: any): Promise<any> {
    // In a real implementation, this would update a post via the social media API
    console.log(`Updating social post ${id}:`, data);
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async deleteSocialPost(id: string): Promise<any> {
    // In a real implementation, this would delete a post via the social media API
    console.log(`Deleting social post ${id}`);
    return { success: true, message: `Post ${id} deleted successfully` };
  }
}

export const storage = new MemStorage();
