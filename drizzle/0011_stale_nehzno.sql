CREATE TABLE `alert_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_subscribers_email_unique` ON `alert_subscribers` (`email`);--> statement-breakpoint
ALTER TABLE `ribbis_alerts` ADD `alert_status` text DEFAULT 'Active' NOT NULL;--> statement-breakpoint
ALTER TABLE `ribbis_alerts` ADD `reviewed_by` text DEFAULT 'Kav Haribis' NOT NULL;--> statement-breakpoint
ALTER TABLE `ribbis_alerts` ADD `expires_at` text DEFAULT '' NOT NULL;