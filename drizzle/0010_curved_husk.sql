CREATE TABLE `alert_tips` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`tip` text NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_tips_reference_unique` ON `alert_tips` (`reference`);