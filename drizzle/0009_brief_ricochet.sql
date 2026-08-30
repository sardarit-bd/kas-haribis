CREATE TABLE `ribbis_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`alert_date` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'General Alert' NOT NULL,
	`severity` text DEFAULT 'Important' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`full_details` text DEFAULT '' NOT NULL,
	`action_label` text DEFAULT '' NOT NULL,
	`action_url` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
