CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE TABLE `reserved_aliases` (
	`alias` text PRIMARY KEY NOT NULL,
	`reason` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`userId`);--> statement-breakpoint
CREATE INDEX `session_token_idx` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`role` text DEFAULT 'user',
	`premiumUntil` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`notification_expiry` integer DEFAULT true,
	`default_expiry_days` integer DEFAULT 30,
	`analytics_sharing` integer DEFAULT false,
	`theme` text DEFAULT 'system',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ANALYTICS_EVENTS` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`short_key` text,
	`clicked_at` integer,
	`ip_address` text,
	`referrer` text,
	`user_agent` text,
	`country` text,
	`city` text,
	`device_type` text,
	`browser` text,
	`os` text,
	FOREIGN KEY (`short_key`) REFERENCES `URL_MAP`(`short_key`) ON UPDATE cascade ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ANALYTICS_EVENTS`("id", "short_key", "clicked_at", "ip_address", "referrer", "user_agent", "country", "city", "device_type", "browser", "os") SELECT "id", "short_key", "clicked_at", "ip_address", "referrer", "user_agent", "country", "city", "device_type", "browser", "os" FROM `ANALYTICS_EVENTS`;--> statement-breakpoint
DROP TABLE `ANALYTICS_EVENTS`;--> statement-breakpoint
ALTER TABLE `__new_ANALYTICS_EVENTS` RENAME TO `ANALYTICS_EVENTS`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `index_short_key` ON `ANALYTICS_EVENTS` (`short_key`,`id`);--> statement-breakpoint
CREATE INDEX `idx_analytics_clicked_at` ON `ANALYTICS_EVENTS` (`clicked_at`);--> statement-breakpoint
ALTER TABLE `URL_MAP` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `URL_MAP` ADD `is_custom_alias` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `URL_MAP` ADD `click_count` integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX `idx_url_map_user_id` ON `URL_MAP` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_url_map_expires_at` ON `URL_MAP` (`expires_at`);