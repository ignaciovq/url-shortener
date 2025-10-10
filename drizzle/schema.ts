import { sqliteTable, uniqueIndex, integer, text, index } from "drizzle-orm/sqlite-core"

export const analyticsEvents = sqliteTable("ANALYTICS_EVENTS", {
	id: integer().primaryKey({ autoIncrement: true }),
	shortKey: text("short_key").references(() => urlMap.shortKey, { onUpdate: "cascade" } ),
	clickedAt: integer("clicked_at"),
	ipAddress: text("ip_address"),
	referrer: text(),
	userAgent: text("user_agent"),
},
(table) => [
	uniqueIndex("index_short_key").on(table.shortKey, table.id),
]);

export const urlMap = sqliteTable("URL_MAP", {
	shortKey: text("short_key").primaryKey().notNull(),
	fullUrl: text("full_url"),
	createdAt: integer("created_at").notNull(),
	expiresAt: integer("expires_at"),
},
(table) => [
	index("index_key_url").on(table.fullUrl, table.shortKey),
]);

