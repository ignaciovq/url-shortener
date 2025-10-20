import { sqliteTable, text, integer, primaryKey, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ============================================
// BETTER AUTH TABLES
// ============================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // Additional fields
  role: text("role").default("user"),
  premiumUntil: integer("premiumUntil", { mode: "timestamp" }),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [
  index("session_userId_idx").on(table.userId),
  index("session_token_idx").on(table.token),
]);

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.providerId, table.accountId] }),
  index("account_userId_idx").on(table.userId),
]);

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("verification_identifier_idx").on(table.identifier),
]);

// ============================================
// APPLICATION SPECIFIC TABLES (EXISTING + MODIFIED)
// ============================================

export const urlMap = sqliteTable("URL_MAP", {
  shortKey: text("short_key").primaryKey().notNull(),
  fullUrl: text("full_url"),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at"),
  // New fields for user association
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  isCustomAlias: integer("is_custom_alias", { mode: "boolean" }).default(false),
  clickCount: integer("click_count").default(0),
}, (table) => [
  index("index_key_url").on(table.fullUrl, table.shortKey),
  index("idx_url_map_user_id").on(table.userId),
  index("idx_url_map_expires_at").on(table.expiresAt),
]);

export const analyticsEvents = sqliteTable("ANALYTICS_EVENTS", {
  id: integer().primaryKey({ autoIncrement: true }),
  shortKey: text("short_key").references(() => urlMap.shortKey, { onUpdate: "cascade" }),
  clickedAt: integer("clicked_at"),
  ipAddress: text("ip_address"),
  referrer: text(),
  userAgent: text("user_agent"),
  // Additional analytics fields
  country: text("country"),
  city: text("city"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
}, (table) => [
  uniqueIndex("index_short_key").on(table.shortKey, table.id),
  index("idx_analytics_clicked_at").on(table.clickedAt),
]);

// ============================================
// NEW APPLICATION TABLES
// ============================================

export const userPreferences = sqliteTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  notificationExpiry: integer("notification_expiry", { mode: "boolean" }).default(true),
  defaultExpiryDays: integer("default_expiry_days").default(30),
  analyticsSharing: integer("analytics_sharing", { mode: "boolean" }).default(false),
  theme: text("theme").default("system"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reservedAliases = sqliteTable("reserved_aliases", {
  alias: text("alias").primaryKey(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type UrlMap = typeof urlMap.$inferSelect;
export type NewUrlMap = typeof urlMap.$inferInsert;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export type ReservedAlias = typeof reservedAliases.$inferSelect;
export type NewReservedAlias = typeof reservedAliases.$inferInsert;