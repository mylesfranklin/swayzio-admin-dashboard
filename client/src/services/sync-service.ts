/**
 * Sync Service
 * 
 * This service handles synchronization between HubSpot and Stripe data,
 * including manual sync triggers, sync status monitoring, and event history.
 */

import { apiRequest } from "@/lib/queryClient";
import { SyncEvent } from "@/components/integrations/sync-status";

export interface SyncConfig {
  isEnabled: boolean;
  frequency: number;
  fields: string[];
  primarySystems: {
    [field: string]: "hubspot" | "stripe";
  };
  lastSynced?: string;
}

export interface SyncOptions {
  type?: "full" | "partial";
  customerIds?: string[];
  includeHubspot?: boolean;
  includeStripe?: boolean;
}

export interface SyncJobStatus {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

class SyncService {
  /**
   * Start a synchronization job
   * @param options - Sync options
   * @returns Promise<{jobId: string}> - ID of the created sync job
   */
  async startSync(options: SyncOptions = {}) {
    const response = await apiRequest("POST", "/api/sync", options);
    return await response.json();
  }

  /**
   * Get the status of a sync job
   * @param jobId - ID of the sync job
   * @returns Promise<SyncJobStatus> - Current status of the sync job
   */
  async getSyncJobStatus(jobId: string) {
    const response = await apiRequest("GET", `/api/sync/jobs/${jobId}`, undefined);
    return await response.json();
  }

  /**
   * Get sync history/events
   * @param options - Filter options
   * @returns Promise<SyncEvent[]> - List of sync events
   */
  async getSyncEvents(options = {}) {
    const queryParams = new URLSearchParams(options as any).toString();
    const response = await apiRequest("GET", `/api/sync/events?${queryParams}`, undefined);
    return await response.json();
  }

  /**
   * Get sync configuration
   * @returns Promise<SyncConfig> - Current sync configuration
   */
  async getSyncConfig() {
    const response = await apiRequest("GET", "/api/sync/config", undefined);
    return await response.json();
  }

  /**
   * Update sync configuration
   * @param config - Updated sync configuration
   * @returns Promise<SyncConfig> - Updated sync configuration
   */
  async updateSyncConfig(config: Partial<SyncConfig>) {
    const response = await apiRequest("PATCH", "/api/sync/config", config);
    return await response.json();
  }

  /**
   * Sync a specific customer
   * @param customerId - Internal customer ID
   * @returns Promise<{success: boolean}> - Result of the customer sync
   */
  async syncCustomer(customerId: string) {
    const response = await apiRequest("POST", `/api/customers/${customerId}/sync`, {});
    return await response.json();
  }

  /**
   * Get recent sync statistics
   * @returns Promise<Object> - Sync statistics
   */
  async getSyncStats() {
    const response = await apiRequest("GET", "/api/sync/stats", undefined);
    return await response.json();
  }
}

export default new SyncService();
