/**
 * HubSpot Service
 * 
 * This service handles integration with the HubSpot API to fetch and
 * manage customer data, including contacts, companies, deals, and activities.
 */

import { apiRequest } from "@/lib/queryClient";

export interface HubSpotContact {
  id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    company?: string;
    createdate: string;
    lastmodifieddate: string;
    lifecyclestage?: string;
    hs_lead_status?: string;
    [key: string]: any;
  };
}

export interface HubSpotActivity {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  details: {
    [key: string]: any;
  };
  contactId: string;
  userId?: string;
  properties?: {
    [key: string]: any;
  };
}

export interface HubSpotContactsResponse {
  contacts: HubSpotContact[];
  pagination: {
    count: number;
    hasMore: boolean;
    offset: number;
  };
}

export interface HubSpotActivitiesResponse {
  activities: HubSpotActivity[];
  pagination: {
    count: number;
    hasMore: boolean;
    offset: number;
  };
}

export interface HubSpotSyncResult {
  success: boolean;
  syncedFields: string[];
  timestamp: string;
  contactId: string;
}

class HubSpotService {
  /**
   * Fetch all contacts from HubSpot
   * @param options - Pagination and filtering options
   * @returns Promise<HubSpotContactsResponse> - List of contacts
   */
  async getContacts(options = {}) {
    const queryParams = new URLSearchParams(options as any).toString();
    const response = await apiRequest("GET", `/api/hubspot/contacts?${queryParams}`, undefined);
    return await response.json();
  }

  /**
   * Fetch a single contact by ID
   * @param contactId - HubSpot contact ID
   * @returns Promise<HubSpotContact> - Contact details
   */
  async getContactById(contactId: string) {
    const response = await apiRequest("GET", `/api/hubspot/contacts/${contactId}`, undefined);
    return await response.json();
  }

  /**
   * Fetch recent activities for a contact
   * @param contactId - HubSpot contact ID
   * @param options - Pagination and filtering options
   * @returns Promise<HubSpotActivitiesResponse> - List of activities
   */
  async getContactActivities(contactId: string, options = {}) {
    const queryParams = new URLSearchParams(options as any).toString();
    const response = await apiRequest("GET", `/api/hubspot/contacts/${contactId}/activities?${queryParams}`, undefined);
    return await response.json();
  }

  /**
   * Create a new contact in HubSpot
   * @param contactData - Contact properties
   * @returns Promise<HubSpotContact> - Created contact
   */
  async createContact(contactData: any) {
    const response = await apiRequest("POST", "/api/hubspot/contacts", contactData);
    return await response.json();
  }

  /**
   * Update an existing contact in HubSpot
   * @param contactId - HubSpot contact ID
   * @param contactData - Updated contact properties
   * @returns Promise<HubSpotContact> - Updated contact
   */
  async updateContact(contactId: string, contactData: any) {
    const response = await apiRequest("PATCH", `/api/hubspot/contacts/${contactId}`, contactData);
    return await response.json();
  }

  /**
   * Sync contact data between HubSpot and other systems
   * @param contactId - HubSpot contact ID
   * @param externalData - Data from external system (e.g., Stripe)
   * @returns Promise<HubSpotSyncResult> - Sync result
   */
  async syncContactData(contactId: string, externalData: any) {
    const response = await apiRequest("POST", `/api/hubspot/contacts/${contactId}/sync`, externalData);
    return await response.json();
  }

  /**
   * Get integration status and configuration
   * @returns Promise<Object> - Integration configuration
   */
  async getIntegrationConfig() {
    const response = await apiRequest("GET", "/api/integrations/hubspot", undefined);
    return await response.json();
  }

  /**
   * Update integration configuration
   * @param config - Updated configuration
   * @returns Promise<Object> - Updated configuration
   */
  async updateIntegrationConfig(config: any) {
    const response = await apiRequest("PATCH", "/api/integrations/hubspot/update", config);
    return await response.json();
  }
}

export default new HubSpotService();
