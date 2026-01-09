import { db } from "./db";
import { integrationCache, integrationSyncState } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";

export type CacheEntry<T = any> = {
  data: T;
  lastUpdated: Date;
  expiresAt: Date;
  isStale: boolean;
};

export type SyncState = {
  integration: string;
  lastSyncStarted: Date | null;
  lastSyncCompleted: Date | null;
  syncCursor: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  totalRecords: number | null;
  errorMessage: string | null;
};

const DEFAULT_TTL_MINUTES = 7 * 60;
const STALE_THRESHOLD_MINUTES = 5;
const BACKGROUND_REFRESH_INTERVAL_HOURS = 6;

type RefreshFunction = () => Promise<any>;

class CacheManager {
  private inMemoryCache: Map<string, CacheEntry> = new Map();
  private refreshPromises: Map<string, Promise<any>> = new Map();
  private scheduledRefreshers: Map<string, RefreshFunction> = new Map();
  private refreshInterval: NodeJS.Timeout | null = null;

  private getCacheKey(integration: string, key: string): string {
    return `${integration}:${key}`;
  }

  async get<T>(integration: string, key: string): Promise<CacheEntry<T> | null> {
    const cacheKey = this.getCacheKey(integration, key);
    
    // Primary: in-memory cache
    const memEntry = this.inMemoryCache.get(cacheKey);
    if (memEntry) {
      const now = new Date();
      memEntry.isStale = now > new Date(memEntry.expiresAt.getTime() - STALE_THRESHOLD_MINUTES * 60 * 1000);
      return memEntry as CacheEntry<T>;
    }

    // Fallback: database cache (skip if DB issues persist)
    try {
      const dbEntry = await db
        .select()
        .from(integrationCache)
        .where(and(
          eq(integrationCache.integration, integration),
          eq(integrationCache.cacheKey, key)
        ))
        .limit(1);

      if (dbEntry && dbEntry.length > 0) {
        const entry = dbEntry[0];
        const now = new Date();
        const isExpired = now > new Date(entry.expiresAt);
        const isStale = now > new Date(new Date(entry.expiresAt).getTime() - STALE_THRESHOLD_MINUTES * 60 * 1000);
        
        if (isExpired) {
          return null;
        }

        const cacheEntry: CacheEntry<T> = {
          data: entry.data as T,
          lastUpdated: new Date(entry.lastUpdated),
          expiresAt: new Date(entry.expiresAt),
          isStale
        };

        this.inMemoryCache.set(cacheKey, cacheEntry);
        return cacheEntry;
      }
    } catch (error: any) {
      // Silently skip DB errors - in-memory cache will be used
      if (!error?.message?.includes('Cannot read properties of null')) {
        console.error(`Cache read error for ${cacheKey}:`, error?.message || error);
      }
    }

    return null;
  }

  async set<T>(integration: string, key: string, data: T, ttlMinutes: number = DEFAULT_TTL_MINUTES): Promise<void> {
    const cacheKey = this.getCacheKey(integration, key);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    const cacheEntry: CacheEntry<T> = {
      data,
      lastUpdated: now,
      expiresAt,
      isStale: false
    };

    this.inMemoryCache.set(cacheKey, cacheEntry);

    // Try to persist to database (in-memory is already set, so DB failure is non-critical)
    try {
      const existing = await db
        .select({ id: integrationCache.id })
        .from(integrationCache)
        .where(and(
          eq(integrationCache.integration, integration),
          eq(integrationCache.cacheKey, key)
        ))
        .limit(1);

      if (existing && existing.length > 0) {
        await db
          .update(integrationCache)
          .set({
            data: data as any,
            lastUpdated: now,
            expiresAt,
            isStale: false
          })
          .where(eq(integrationCache.id, existing[0].id));
      } else {
        await db
          .insert(integrationCache)
          .values({
            integration,
            cacheKey: key,
            data: data as any,
            lastUpdated: now,
            expiresAt,
            isStale: false
          });
      }
    } catch (error: any) {
      // Silently skip DB errors - in-memory cache already has the data
      if (!error?.message?.includes('Cannot read properties of null')) {
        console.error(`Cache write error for ${cacheKey}:`, error?.message || error);
      }
    }
  }

  async invalidate(integration: string, key?: string): Promise<void> {
    if (key) {
      const cacheKey = this.getCacheKey(integration, key);
      this.inMemoryCache.delete(cacheKey);
      
      try {
        await db
          .delete(integrationCache)
          .where(and(
            eq(integrationCache.integration, integration),
            eq(integrationCache.cacheKey, key)
          ));
      } catch (error) {
        console.error(`Cache invalidation error for ${cacheKey}:`, error);
      }
    } else {
      for (const [k] of this.inMemoryCache) {
        if (k.startsWith(`${integration}:`)) {
          this.inMemoryCache.delete(k);
        }
      }
      
      try {
        await db
          .delete(integrationCache)
          .where(eq(integrationCache.integration, integration));
      } catch (error) {
        console.error(`Cache invalidation error for ${integration}:`, error);
      }
    }
  }

  async getOrFetch<T>(
    integration: string,
    key: string,
    fetchFn: () => Promise<T>,
    ttlMinutes: number = DEFAULT_TTL_MINUTES
  ): Promise<{ data: T; lastUpdated: Date; isStale: boolean; fromCache: boolean }> {
    const refreshKey = this.getCacheKey(integration, key);
    const cached = await this.get<T>(integration, key);
    
    // Return fresh cached data immediately
    if (cached && !cached.isStale) {
      return {
        data: cached.data,
        lastUpdated: cached.lastUpdated,
        isStale: false,
        fromCache: true
      };
    }

    // Check if there's already a fetch in progress (single-flight pattern)
    const existingPromise = this.refreshPromises.get(refreshKey);
    if (existingPromise) {
      // If we have stale cached data, return it while waiting for refresh
      if (cached) {
        return {
          data: cached.data,
          lastUpdated: cached.lastUpdated,
          isStale: true,
          fromCache: true
        };
      }
      // Otherwise wait for the in-flight fetch to complete
      try {
        const freshData = await existingPromise as T;
        return {
          data: freshData,
          lastUpdated: new Date(),
          isStale: false,
          fromCache: false
        };
      } catch (error) {
        throw error;
      }
    }

    // Start a new fetch and register the promise (single-flight locking)
    const refreshPromise = fetchFn()
      .then(async (freshData) => {
        await this.set(integration, key, freshData, ttlMinutes);
        return freshData;
      })
      .catch((error) => {
        console.error(`Fetch failed for ${refreshKey}:`, error);
        throw error;
      })
      .finally(() => {
        this.refreshPromises.delete(refreshKey);
      });
    
    this.refreshPromises.set(refreshKey, refreshPromise);

    // If we have stale cached data, return it immediately while refresh runs in background
    if (cached) {
      return {
        data: cached.data,
        lastUpdated: cached.lastUpdated,
        isStale: true,
        fromCache: true
      };
    }

    // No cached data - wait for the fetch to complete
    try {
      const freshData = await refreshPromise;
      return {
        data: freshData,
        lastUpdated: new Date(),
        isStale: false,
        fromCache: false
      };
    } catch (error) {
      throw error;
    }
  }

  async getSyncState(integration: string): Promise<SyncState | null> {
    try {
      const result = await db
        .select()
        .from(integrationSyncState)
        .where(eq(integrationSyncState.integration, integration))
        .limit(1);

      if (result.length > 0) {
        return {
          integration: result[0].integration,
          lastSyncStarted: result[0].lastSyncStarted,
          lastSyncCompleted: result[0].lastSyncCompleted,
          syncCursor: result[0].syncCursor,
          syncStatus: result[0].syncStatus as 'idle' | 'syncing' | 'error',
          totalRecords: result[0].totalRecords,
          errorMessage: result[0].errorMessage
        };
      }
      return null;
    } catch (error: any) {
      // Silently handle common DB driver issues
      if (!error?.message?.includes('Cannot read properties of null')) {
        console.error(`Error getting sync state for ${integration}:`, error?.message || error);
      }
      return null;
    }
  }

  async updateSyncState(
    integration: string,
    updates: Partial<Omit<SyncState, 'integration'>>
  ): Promise<void> {
    try {
      const existing = await db
        .select({ id: integrationSyncState.id })
        .from(integrationSyncState)
        .where(eq(integrationSyncState.integration, integration))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(integrationSyncState)
          .set(updates as any)
          .where(eq(integrationSyncState.id, existing[0].id));
      } else {
        await db
          .insert(integrationSyncState)
          .values({
            integration,
            syncStatus: 'idle',
            ...updates
          } as any);
      }
    } catch (error) {
      console.error(`Error updating sync state for ${integration}:`, error);
    }
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    
    for (const [key, entry] of this.inMemoryCache) {
      if (now > entry.expiresAt) {
        this.inMemoryCache.delete(key);
      }
    }

    try {
      const result = await db
        .delete(integrationCache)
        .where(lt(integrationCache.expiresAt, now));
      return 0;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  registerRefresher(integration: string, key: string, fn: RefreshFunction): void {
    const refreshKey = this.getCacheKey(integration, key);
    this.scheduledRefreshers.set(refreshKey, fn);
    console.log(`Registered scheduled refresher: ${refreshKey}`);
  }

  async refreshAll(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Starting scheduled cache refresh for ${this.scheduledRefreshers.size} integrations...`);
    
    const ttlHours = Math.round(DEFAULT_TTL_MINUTES / 60);
    for (const [refreshKey, fn] of this.scheduledRefreshers) {
      const [integration, key] = refreshKey.split(':');
      try {
        console.log(`  Refreshing ${refreshKey}...`);
        // Use getOrFetch to participate in single-flight pattern
        const result = await this.getOrFetch(integration, key, fn, DEFAULT_TTL_MINUTES);
        if (result.fromCache && !result.isStale) {
          console.log(`  ✓ ${refreshKey} already cached (TTL: ${ttlHours}h)`);
        } else {
          console.log(`  ✓ ${refreshKey} refreshed successfully (TTL: ${ttlHours}h)`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to refresh ${refreshKey}:`, error);
      }
    }
    
    console.log(`[${new Date().toISOString()}] Scheduled cache refresh complete`);
  }

  startBackgroundRefresh(intervalHours: number = BACKGROUND_REFRESH_INTERVAL_HOURS): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;
    console.log(`Starting background cache refresh every ${intervalHours} hours`);
    
    this.refreshInterval = setInterval(() => {
      this.refreshAll().catch(err => {
        console.error('Background refresh failed:', err);
      });
    }, intervalMs);

    setTimeout(() => {
      this.refreshAll().catch(err => {
        console.error('Initial background refresh failed:', err);
      });
    }, 30000);
  }

  stopBackgroundRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('Background cache refresh stopped');
    }
  }
}

export const cacheManager = new CacheManager();
