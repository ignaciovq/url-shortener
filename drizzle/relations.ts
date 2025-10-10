import { relations } from "drizzle-orm/relations";
import { urlMap, analyticsEvents } from "./schema";

export const analyticsEventsRelations = relations(analyticsEvents, ({one}) => ({
	urlMap: one(urlMap, {
		fields: [analyticsEvents.shortKey],
		references: [urlMap.shortKey]
	}),
}));

export const urlMapRelations = relations(urlMap, ({many}) => ({
	analyticsEvents: many(analyticsEvents),
}));