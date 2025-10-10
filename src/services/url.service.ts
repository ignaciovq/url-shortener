import { db, urlMap, analyticsEvents } from '@/db';
import { eq, desc, count } from 'drizzle-orm';
import {
  generateShortCode,
  generateRandomCode,
  isValidAlias
} from '@/lib/shortcode';
import type { UrlMap } from '@/db';

/**
 * Service for managing shortened URLs
 */
export class UrlService {

  /**
   * Create a new shortened URL
   * @param originalUrl - The original URL to shorten
   * @param customAlias - Optional custom alias for the short URL
   * @param expiresAt - Optional expiration timestamp
   * @returns The created URL mapping
   */
  static async createShortUrl(
    originalUrl: string,
    customAlias?: string,
    expiresAt?: number
  ): Promise<UrlMap> {
    // Validate URL format
    try {
      const url = new URL(originalUrl);
      // Ensure it's http or https
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL protocol');
      }
    } catch {
      throw new Error('Invalid URL format');
    }

    let shortKey: string;

    if (customAlias) {
      // Validate and use custom alias
      if (!isValidAlias(customAlias)) {
        throw new Error('Invalid alias format. Use 3-20 alphanumeric characters, hyphens, or underscores.');
      }

      // Check if alias already exists
      const existing = await db.select()
        .from(urlMap)
        .where(eq(urlMap.shortKey, customAlias))
        .limit(1);

      if (existing.length > 0) {
        throw new Error('This alias is already in use');
      }

      shortKey = customAlias;
    } else {
      // Generate base62 short code
      shortKey = await this.generateUniqueShortCode();
    }

    // Insert the new URL mapping
    const createdAt = Math.floor(Date.now() / 1000); // Unix timestamp

    try {
      await db.insert(urlMap).values({
        shortKey,
        fullUrl: originalUrl,
        createdAt,
        expiresAt: expiresAt || null,
      });

      // Fetch and return the created record
      const created = await db.select()
        .from(urlMap)
        .where(eq(urlMap.shortKey, shortKey))
        .limit(1);

      if (created.length === 0) {
        throw new Error('Failed to create short URL');
      }

      return created[0];
    } catch (error) {
      // Handle unique constraint violations
      if (error instanceof Error && error.message?.includes('UNIQUE')) {
        throw new Error('Short code collision. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Generate a unique short code using base62 encoding
   * @returns A unique short code
   */
  private static async generateUniqueShortCode(): Promise<string> {
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Get count of existing URLs to use as counter
      // This is a simple approach - in production, you might use a dedicated counter table
      const result = await db.select({ count: count() })
        .from(urlMap);

      const currentCount = result[0]?.count || 0;

      // Generate short code based on count + random offset
      const randomOffset = Math.floor(Math.random() * 1000);
      const shortCode = generateShortCode(currentCount + randomOffset + attempt * 10000);

      // Check if it already exists
      const existing = await db.select()
        .from(urlMap)
        .where(eq(urlMap.shortKey, shortCode))
        .limit(1);

      if (existing.length === 0) {
        return shortCode;
      }
    }

    // Fallback to random code if counter-based generation fails
    return generateRandomCode(6);
  }

  /**
   * Get the original URL for a short code and track the click
   * @param shortCode - The short code to look up
   * @returns The original URL or null if not found/expired
   */
  static async getOriginalUrl(shortCode: string): Promise<string | null> {
    const result = await db.select()
      .from(urlMap)
      .where(eq(urlMap.shortKey, shortCode))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const urlMapping = result[0];

    // Check if URL has expired
    if (urlMapping.expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      if (now > urlMapping.expiresAt) {
        return null; // URL has expired
      }
    }

    // Track the click in analytics (fire and forget)
    this.trackClick(shortCode).catch(console.error);

    return urlMapping.fullUrl;
  }

  /**
   * Track a click on a short URL
   * @param shortCode - The short code that was clicked
   */
  private static async trackClick(shortCode: string): Promise<void> {
    const clickedAt = Math.floor(Date.now() / 1000);

    try {
      await db.insert(analyticsEvents).values({
        shortKey: shortCode,
        clickedAt,
        ipAddress: null, // Will be populated from request context when we have it
        referrer: null,   // Will be populated from request headers
        userAgent: null,  // Will be populated from request headers
      });
    } catch (error) {
      // Log error but don't fail the redirect
      console.error('Failed to track click:', error);
    }
  }

  /**
   * Check if a custom alias is available
   * @param alias - The alias to check
   * @returns true if available, false otherwise
   */
  static async checkAliasAvailability(alias: string): Promise<boolean> {
    if (!isValidAlias(alias)) {
      return false;
    }

    const existing = await db.select()
      .from(urlMap)
      .where(eq(urlMap.shortKey, alias))
      .limit(1);

    return existing.length === 0;
  }

  /**
   * Get statistics for a short URL
   * @param shortCode - The short code to get stats for
   * @returns URL statistics including click count
   */
  static async getUrlStats(shortCode: string): Promise<{
    shortKey: string;
    fullUrl: string | null;
    createdAt: number;
    clicks: number;
    lastClickedAt?: number;
  } | null> {
    // Get URL info
    const urlResult = await db.select()
      .from(urlMap)
      .where(eq(urlMap.shortKey, shortCode))
      .limit(1);

    if (urlResult.length === 0) {
      return null;
    }

    const url = urlResult[0];

    // Get click count from analytics
    const clickResult = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.shortKey, shortCode));

    const clicks = clickResult[0]?.count || 0;

    // Get last click time
    const lastClickResult = await db.select({ clickedAt: analyticsEvents.clickedAt })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.shortKey, shortCode))
      .orderBy(desc(analyticsEvents.clickedAt))
      .limit(1);

    return {
      shortKey: url.shortKey,
      fullUrl: url.fullUrl,
      createdAt: url.createdAt,
      clicks,
      lastClickedAt: lastClickResult[0]?.clickedAt || undefined,
    };
  }

  /**
   * Delete a shortened URL
   * @param shortCode - The short code to delete
   * @returns true if deleted, false if not found
   */
  static async deleteUrl(shortCode: string): Promise<boolean> {
    await db.delete(urlMap)
      .where(eq(urlMap.shortKey, shortCode));

    // Note: Analytics events will be cascade deleted due to foreign key
    return true; // Drizzle doesn't return affected rows for SQLite
  }

  /**
   * Get recent URLs (for dashboard/history)
   * @param limit - Maximum number of URLs to return
   * @returns Array of recent URL mappings
   */
  static async getRecentUrls(limit: number = 10): Promise<UrlMap[]> {
    return await db.select()
      .from(urlMap)
      .orderBy(desc(urlMap.createdAt))
      .limit(limit);
  }
}