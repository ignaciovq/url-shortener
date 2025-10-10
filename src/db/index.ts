import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create the Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create and export the Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for easy access
export { urlMap, analyticsEvents } from './schema';

// Type exports for use in the application
export type UrlMap = typeof schema.urlMap.$inferSelect;
export type NewUrlMap = typeof schema.urlMap.$inferInsert;
export type AnalyticsEvent = typeof schema.analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof schema.analyticsEvents.$inferInsert;