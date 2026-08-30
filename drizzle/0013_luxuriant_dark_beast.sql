CREATE TABLE `heter_access_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`code_hash` text NOT NULL,
	`code_hint` text NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`code_type` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`use_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`last_used_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `heter_access_codes_code_hash_unique` ON `heter_access_codes` (`code_hash`);--> statement-breakpoint
CREATE TABLE `heter_code_downloads` (
	`token` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`code_id` text NOT NULL,
	`created_at` text NOT NULL
);
