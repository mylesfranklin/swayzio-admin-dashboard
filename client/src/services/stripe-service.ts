/**
 * Stripe Service
 * 
 * This service handles integration with the Stripe API to fetch and
 * manage customer payment data, including subscriptions, invoices, and payment methods.
 */

import { apiRequest } from "@/lib/queryClient";

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  created: number;
  metadata: {
    [key: string]: any;
  };
  currency?: string;
  default_source?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  sources?: {
    data: StripePaymentMethod[];
  };
}

export interface StripePaymentMethod {
  id: string;
  object: string;
  brand: string;
  country: string;
  exp_month: number;
  exp_year: number;
  last4: string;
  funding: string;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  created: number;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
        nickname: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: "month" | "year" | "week" | "day";
          interval_count: number;
        };
      };
      quantity: number;
    }>;
  };
  default_payment_method?: string;
  latest_invoice?: string;
  cancel_at_period_end: boolean;
  collection_method: "charge_automatically" | "send_invoice";
  metadata?: {
    [key: string]: any;
  };
}

export interface StripeInvoice {
  id: string;
  customer: string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  created: number;
  due_date?: number;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  number?: string;
  paid: boolean;
  period_start: number;
  period_end: number;
  lines: {
    data: Array<{
      description: string;
      amount: number;
      currency: string;
      period?: {
        start: number;
        end: number;
      };
    }>;
  };
  payment_intent?: string;
  subscription?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface StripeListResponse<T> {
  data: T[];
  has_more: boolean;
  url: string;
}

class StripeService {
  /**
   * Fetch all customers from Stripe
   * @param options - Pagination and filtering options
   * @returns Promise<StripeListResponse<StripeCustomer>> - List of customers
   */
  async getCustomers(options = {}) {
    const queryParams = new URLSearchParams(options as any).toString();
    const response = await apiRequest("GET", `/api/stripe/customers?${queryParams}`, undefined);
    return await response.json();
  }

  /**
   * Fetch a single customer by ID
   * @param customerId - Stripe customer ID
   * @returns Promise<StripeCustomer> - Customer details
   */
  async getCustomerById(customerId: string) {
    const response = await apiRequest("GET", `/api/stripe/customers/${customerId}`, undefined);
    return await response.json();
  }

  /**
   * Fetch subscriptions for a customer
   * @param customerId - Stripe customer ID
   * @param options - Pagination and filtering options
   * @returns Promise<StripeListResponse<StripeSubscription>> - List of subscriptions
   */
  async getCustomerSubscriptions(customerId: string, options = {}) {
    const queryParams = new URLSearchParams(options as any).toString();
    const response = await apiRequest("GET", `/api/stripe/customers/${customerId}/subscriptions?${queryParams}`, undefined);
    return await response.json();
  }

  /**
   * Fetch invoices for a customer
   * @param customerId - Stripe customer ID
   * @param options - Pagination and filtering options
   * @returns Promise<StripeListResponse<StripeInvoice>> - List of invoices
   */
  async getCustomerInvoices(customerId: string, options = {}) {
    const queryParams = new URLSearchParams(options as any).toString();
    const response = await apiRequest("GET", `/api/stripe/customers/${customerId}/invoices?${queryParams}`, undefined);
    return await response.json();
  }

  /**
   * Create a new customer in Stripe
   * @param customerData - Customer information
   * @returns Promise<StripeCustomer> - Created customer
   */
  async createCustomer(customerData: any) {
    const response = await apiRequest("POST", "/api/stripe/customers", customerData);
    return await response.json();
  }

  /**
   * Update an existing customer in Stripe
   * @param customerId - Stripe customer ID
   * @param customerData - Updated customer information
   * @returns Promise<StripeCustomer> - Updated customer
   */
  async updateCustomer(customerId: string, customerData: any) {
    const response = await apiRequest("PATCH", `/api/stripe/customers/${customerId}`, customerData);
    return await response.json();
  }

  /**
   * Get integration status and configuration
   * @returns Promise<Object> - Integration configuration
   */
  async getIntegrationConfig() {
    const response = await apiRequest("GET", "/api/integrations/stripe", undefined);
    return await response.json();
  }

  /**
   * Update integration configuration
   * @param config - Updated configuration
   * @returns Promise<Object> - Updated configuration
   */
  async updateIntegrationConfig(config: any) {
    const response = await apiRequest("PATCH", "/api/integrations/stripe/update", config);
    return await response.json();
  }
}

export default new StripeService();
