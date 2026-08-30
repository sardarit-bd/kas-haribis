CREATE TABLE `educational_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`resource_type` text DEFAULT 'Coloring Page' NOT NULL,
	`audience` text DEFAULT '' NOT NULL,
	`file_key` text DEFAULT '' NOT NULL,
	`file_name` text DEFAULT '' NOT NULL,
	`file_type` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
