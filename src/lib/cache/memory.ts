/**
 * In-memory cache implementation
 * This is a simple implementation for development and testing
 * In production, use Redis implementation
 */

import { CacheInterface } from './interface';

interface CacheEntry {
  value: string;
  expiresAt?: number;
}

export class MemoryCache implements CacheInterface {
  private cache: Map<string, CacheEntry> = new Map();

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      expiresAt: ttl ? Date.now() + (ttl * 1000) : undefined,
    };

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clean up expired entries (run periodically)
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
let memoryCache: MemoryCache | null = null;

export function getMemoryCache(): MemoryCache {
  if (!memoryCache) {
    memoryCache = new MemoryCache();

    // Set up periodic cleanup (every 5 minutes)
    setInterval(() => {
      memoryCache?.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  return memoryCache;
}