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

// Export schema tables for easy access
export {
  // Auth tables
  user,
  session,
  account,
  verification,
  // App tables
  urlMap,
  analyticsEvents,
  userPreferences,
  reservedAliases
} from './schema';

// Re-export all types
export type {
  // Auth types
  User,
  NewUser,
  Session,
  NewSession,
  Account,
  NewAccount,
  Verification,
  NewVerification,
  // App types
  UrlMap,
  NewUrlMap,
  AnalyticsEvent,
  NewAnalyticsEvent,
  UserPreferences,
  NewUserPreferences,
  ReservedAlias,
  NewReservedAlias
} from './schema';