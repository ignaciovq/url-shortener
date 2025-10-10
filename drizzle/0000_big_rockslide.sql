-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `ANALYTICS_EVENTS` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`short_key` text,
	`clicked_at` integer,
	`ip_address` text,
	`referrer` text,
	`user_agent` text,
	FOREIGN KEY (`short_key`) REFERENCES `URL_MAP`(`short_key`) ON UPDATE cascade ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_short_key` ON `ANALYTICS_EVENTS` (`short_key`,`id`);--> statement-breakpoint
CREATE TABLE `URL_MAP` (
	`short_key` text PRIMARY KEY NOT NULL,
	`full_url` text,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE INDEX `index_key_url` ON `URL_MAP` (`full_url`,`short_key`);
*/