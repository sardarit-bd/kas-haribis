CREATE TABLE `bank_report_access` (
	`token` text PRIMARY KEY NOT NULL,
	`bank_id` text NOT NULL,
	`payment_id` text,
	`method` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bank_report_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`bank_id` text NOT NULL,
	`code_hash` text NOT NULL,
	`code_hint` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bank_report_codes_code_hash_unique` ON `bank_report_codes` (`code_hash`);--> statement-breakpoint
ALTER TABLE `banks` ADD `full_report` text DEFAULT '' NOT NULL;