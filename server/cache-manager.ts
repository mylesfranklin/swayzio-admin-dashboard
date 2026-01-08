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

const DEFAULT_TTL_MINUTES = 15;
const STALE_THRESHOLD_MINUTES = 5;

class CacheManager {
  private inMemoryCache: Map<string, CacheEntry> = new Map();
  private refreshPromises: Map<string, Promise<any>> = new Map();

  private getCacheKey(integration: string, key: string): string {
    return `${integration}:${key}`;
  }

  async get<T>(integration: string, key: string): Promise<CacheEntry<T> | null> {
    const cacheKey = this.getCacheKey(integration, key);
    
    const memEntry = this.inMemoryCache.get(cacheKey);
    if (memEntry) {
      const now = new Date();
      memEntry.isStale = now > new Date(memEntry.expiresAt.getTime() - STALE_THRESHOLD_MINUTES * 60 * 1000);
      return memEntry as CacheEntry<T>;
    }

    try {
      const dbEntry = await db
        .select()
        .from(integrationCache)
        .where(and(
          eq(integrationCache.integration, integration),
          eq(integrationCache.cacheKey, key)
        ))
        .limit(1);

      if (dbEntry.length > 0) {
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
    } catch (error) {
      console.error(`Cache read error for ${cacheKey}:`, error);
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

    try {
      const existing = await db
        .select({ id: integrationCache.id })
        .from(integrationCache)
        .where(and(
          eq(integrationCache.integration, integration),
          eq(integrationCache.cacheKey, key)
        ))
        .limit(1);

      if (existing.length > 0) {
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
    } catch (error) {
      console.error(`Cache write error for ${cacheKey}:`, error);
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
    const cached = await this.get<T>(integration, key);
    
    if (cached && !cached.isStale) {
      return {
        data: cached.data,
        lastUpdated: cached.lastUpdated,
        isStale: false,
        fromCache: true
      };
    }

    if (cached && cached.isStale) {
      const refreshKey = this.getCacheKey(integration, key);
      if (!this.refreshPromises.has(refreshKey)) {
        const refreshPromise = fetchFn()
          .then(async (freshData) => {
            await this.set(integration, key, freshData, ttlMinutes);
            return freshData;
          })
          .catch((error) => {
            console.error(`Background refresh failed for ${refreshKey}:`, error);
            throw error;
          })
          .finally(() => {
            this.refreshPromises.delete(refreshKey);
          });
        
        this.refreshPromises.set(refreshKey, refreshPromise);
      }

      return {
        data: cached.data,
        lastUpdated: cached.lastUpdated,
        isStale: true,
        fromCache: true
      };
    }

    try {
      const freshData = await fetchFn();
      await this.set(integration, key, freshData, ttlMinutes);
      return {
        data: freshData,
        lastUpdated: new Date(),
        isStale: false,
        fromCache: false
      };
    } catch (error) {
      if (cached) {
        return {
          data: cached.data,
          lastUpdated: cached.lastUpdated,
          isStale: true,
          fromCache: true
        };
      }
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
    } catch (error) {
      console.error(`Error getting sync state for ${integration}:`, error);
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
}

export const cacheManager = new CacheManager();
