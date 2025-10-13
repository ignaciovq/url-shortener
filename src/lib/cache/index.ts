/**
 * Cache module entry point
 * Provides a unified interface for caching with automatic fallback
 */

import { CacheInterface } from './interface';
import { getMemoryCache } from './memory';
import { getRedisCache } from './redis';

export type { CacheInterface, CacheKeys } from './interface';

let cacheInstance: CacheInterface | null = null;

/**
 * Get the cache instance
 * Will try to use Redis if available, otherwise falls back to in-memory cache
 * @returns Cache instance
 */
export async function getCache(): Promise<CacheInterface> {
  if (cacheInstance) {
    return cacheInstance;
  }

  // Check if Redis credentials are configured
  const hasRedisConfig = process.env.REDIS_HOST && process.env.REDIS_PASSWORD;

  if (hasRedisConfig && process.env.NODE_ENV === 'production') {
    try {
      console.log('Initializing Redis cache...');
      cacheInstance = await getRedisCache();
      console.log('Redis cache initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis cache, falling back to memory cache:', error);
      cacheInstance = getMemoryCache();
    }
  } else {
    console.log('Using in-memory cache (development mode or Redis not configured)');
    cacheInstance = getMemoryCache();
  }

  return cacheInstance;
}

/**
 * Reset cache instance (useful for testing)
 */
export function resetCache(): void {
  cacheInstance = null;
}