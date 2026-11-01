ALTER TABLE `admin_profiles` ADD `require_password` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `admin_login_attempts` (
	`attempt_key` text PRIMARY KEY NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`blocked_until` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
