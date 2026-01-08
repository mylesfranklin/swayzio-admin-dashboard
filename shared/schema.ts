import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Customer model - represents combined data from HubSpot and Stripe
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  hubspotId: text("hubspot_id"),
  stripeId: text("stripe_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  company: text("company"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastModified: timestamp("last_modified").notNull().defaultNow(),
  stage: text("stage"),
  status: text("status"),
  address: jsonb("address"),
  metadata: jsonb("metadata"),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  hubspotId: true,
  stripeId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  company: true,
  stage: true,
  status: true,
  address: true,
  metadata: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Subscription model - from Stripe
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  stripeId: text("stripe_id").notNull(),
  customerId: text("customer_id").notNull(),
  status: text("status").notNull(),
  created: timestamp("created").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  plan: jsonb("plan").notNull(),
  quantity: integer("quantity").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull(),
  collectionMethod: text("collection_method").notNull(),
  defaultPaymentMethod: text("default_payment_method"),
  latestInvoice: text("latest_invoice"),
  metadata: jsonb("metadata"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  stripeId: true,
  customerId: true,
  status: true,
  created: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  plan: true,
  quantity: true,
  cancelAtPeriodEnd: true,
  collectionMethod: true,
  defaultPaymentMethod: true,
  latestInvoice: true,
  metadata: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Activity model - from HubSpot
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  activityId: text("activity_id").notNull(),
  contactId: text("contact_id").notNull(),
  type: text("type").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  title: text("title").notNull(),
  details: jsonb("details"),
  userId: text("user_id"),
  properties: jsonb("properties"),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  activityId: true,
  contactId: true,
  type: true,
  timestamp: true,
  title: true,
  details: true,
  userId: true,
  properties: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Invoice model - from Stripe
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  customer: text("customer").notNull(),
  status: text("status").notNull(),
  created: timestamp("created").notNull(),
  dueDate: timestamp("due_date"),
  amountDue: integer("amount_due").notNull(),
  amountPaid: integer("amount_paid").notNull(),
  amountRemaining: integer("amount_remaining").notNull(),
  currency: text("currency").notNull(),
  number: text("number"),
  paid: boolean("paid").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  lines: jsonb("lines").notNull(),
  paymentIntent: text("payment_intent"),
  subscription: text("subscription"),
  metadata: jsonb("metadata"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceId: true,
  customer: true,
  status: true,
  created: true,
  dueDate: true,
  amountDue: true,
  amountPaid: true,
  amountRemaining: true,
  currency: true,
  number: true,
  paid: true,
  periodStart: true,
  periodEnd: true,
  lines: true,
  paymentIntent: true,
  subscription: true,
  metadata: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Integration configuration model
export const integrationConfigs = pgTable("integration_configs", {
  id: serial("id").primaryKey(),
  hubspotApiKey: text("hubspot_api_key"),
  hubspotBaseUrl: text("hubspot_base_url"),
  hubspotPortalId: text("hubspot_portal_id"),
  hubspotScopes: jsonb("hubspot_scopes"),
  hubspotFieldMapping: jsonb("hubspot_field_mapping"),
  stripeApiKey: text("stripe_api_key"),
  stripeWebhookSecret: text("stripe_webhook_secret"),
  stripeBaseUrl: text("stripe_base_url"),
  stripeCurrency: text("stripe_currency"),
  stripeFieldMapping: jsonb("stripe_field_mapping"),
  syncFrequency: integer("sync_frequency"),
  syncFields: jsonb("sync_fields"),
  primarySystems: jsonb("primary_systems"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigs).pick({
  hubspotApiKey: true,
  hubspotBaseUrl: true,
  hubspotPortalId: true,
  hubspotScopes: true,
  hubspotFieldMapping: true,
  stripeApiKey: true,
  stripeWebhookSecret: true,
  stripeBaseUrl: true,
  stripeCurrency: true,
  stripeFieldMapping: true,
  syncFrequency: true,
  syncFields: true,
  primarySystems: true,
});

export type InsertIntegrationConfig = z.infer<typeof insertIntegrationConfigSchema>;
export type IntegrationConfig = typeof integrationConfigs.$inferSelect;

// Sync history model
export const syncEvents = pgTable("sync_events", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull(),
  customerIds: jsonb("customer_ids"),
  fullSync: boolean("full_sync").notNull(),
  operations: jsonb("operations").notNull(),
  errorCount: integer("error_count"),
  errorMessage: text("error_message"),
});

export const insertSyncEventSchema = createInsertSchema(syncEvents).pick({
  eventId: true,
  timestamp: true,
  status: true,
  customerIds: true,
  fullSync: true,
  operations: true,
  errorCount: true,
  errorMessage: true,
});

export type InsertSyncEvent = z.infer<typeof insertSyncEventSchema>;
export type SyncEvent = typeof syncEvents.$inferSelect;

// Integration cache model - stores cached API responses
export const integrationCache = pgTable("integration_cache", {
  id: serial("id").primaryKey(),
  integration: text("integration").notNull(), // 'hubspot', 'stripe', 'kit', 'mercury'
  cacheKey: text("cache_key").notNull(), // e.g. 'dashboard', 'customers', 'subscriptions'
  data: jsonb("data").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isStale: boolean("is_stale").notNull().default(false),
});

export const insertIntegrationCacheSchema = createInsertSchema(integrationCache).pick({
  integration: true,
  cacheKey: true,
  data: true,
  lastUpdated: true,
  expiresAt: true,
  isStale: true,
});

export type InsertIntegrationCache = z.infer<typeof insertIntegrationCacheSchema>;
export type IntegrationCache = typeof integrationCache.$inferSelect;

// Integration sync state - tracks sync progress and cursors
export const integrationSyncState = pgTable("integration_sync_state", {
  id: serial("id").primaryKey(),
  integration: text("integration").notNull().unique(), // 'hubspot', 'stripe', 'kit', 'mercury'
  lastSyncStarted: timestamp("last_sync_started"),
  lastSyncCompleted: timestamp("last_sync_completed"),
  syncCursor: text("sync_cursor"), // pagination cursor for incremental sync
  syncStatus: text("sync_status").notNull().default("idle"), // 'idle', 'syncing', 'error'
  totalRecords: integer("total_records"),
  errorMessage: text("error_message"),
});

export const insertIntegrationSyncStateSchema = createInsertSchema(integrationSyncState).pick({
  integration: true,
  lastSyncStarted: true,
  lastSyncCompleted: true,
  syncCursor: true,
  syncStatus: true,
  totalRecords: true,
  errorMessage: true,
});

export type InsertIntegrationSyncState = z.infer<typeof insertIntegrationSyncStateSchema>;
export type IntegrationSyncState = typeof integrationSyncState.$inferSelect;
