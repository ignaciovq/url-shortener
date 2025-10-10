/**
 * Redis cache implementation
 * This is the production-ready cache implementation using Redis
 */

import { createClient, RedisClientType } from 'redis';
import { CacheInterface } from './interface';

export class RedisCache implements CacheInterface {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      const redisUrl = this.buildRedisUrl();

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis: Max reconnection attempts reached');
              return false;
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      this.isConnected = false;
    }
  }

  private buildRedisUrl(): string {
    const username = process.env.REDIS_USERNAME || '';
    const password = process.env.REDIS_PASSWORD || '';
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || '6379';

    if (username && password) {
      return `redis://${username}:${password}@${host}:${port}`;
    } else if (password) {
      return `redis://:${password}@${host}:${port}`;
    } else {
      return `redis://${host}:${port}`;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected && this.client) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to reconnect to Redis:', error);
        throw new Error('Redis connection failed');
      }
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      await this.ensureConnected();
      if (!this.client) return null;

      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await this.ensureConnected();
      if (!this.client) return;

      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.ensureConnected();
      if (!this.client) return false;

      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.ensureConnected();
      if (!this.client) return;

      // Use pattern matching to delete only our URL cache keys
      const keys = await this.client.keys('url:*');
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis CLEAR error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureConnected();
      if (!this.client) return false;

      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Disconnect from Redis (call on application shutdown)
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Singleton instance
let redisCache: RedisCache | null = null;

export async function getRedisCache(): Promise<RedisCache> {
  if (!redisCache) {
    redisCache = new RedisCache();
  }
  return redisCache;
}

// Clean up on process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    if (redisCache) {
      await redisCache.disconnect();
    }
  });

  process.on('SIGTERM', async () => {
    if (redisCache) {
      await redisCache.disconnect();
    }
  });
}