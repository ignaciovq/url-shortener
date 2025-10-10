/**
 * Cache interface for URL shortener
 * This provides an abstraction layer for caching
 * allowing easy switching between in-memory and Redis implementations
 */

export interface CacheInterface {
  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  set(key: string, value: string, ttl?: number): Promise<void>;

  /**
   * Delete a value from the cache
   * @param key - The cache key
   * @returns true if deleted, false if not found
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clear all cache entries (use with caution)
   */
  clear(): Promise<void>;

  /**
   * Check if a key exists in the cache
   * @param key - The cache key
   * @returns true if exists, false otherwise
   */
  exists(key: string): Promise<boolean>;
}

/**
 * Cache key generation utilities
 */
export class CacheKeys {
  private static readonly PREFIX = 'url:';

  /**
   * Generate cache key for a URL mapping
   * @param shortCode - The short code
   * @returns The cache key
   */
  static urlMapping(shortCode: string): string {
    return `${this.PREFIX}${shortCode}`;
  }

  /**
   * Generate cache key for URL stats
   * @param shortCode - The short code
   * @returns The cache key
   */
  static urlStats(shortCode: string): string {
    return `${this.PREFIX}stats:${shortCode}`;
  }

  /**
   * Generate cache key for alias availability
   * @param alias - The alias to check
   * @returns The cache key
   */
  static aliasCheck(alias: string): string {
    return `${this.PREFIX}alias:${alias}`;
  }
}