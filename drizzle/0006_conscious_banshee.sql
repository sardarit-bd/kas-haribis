CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`hebrew_title` text DEFAULT '' NOT NULL,
	`publication_date` text DEFAULT '' NOT NULL,
	`author` text DEFAULT 'Kav Haribis' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`pdf_url` text DEFAULT '' NOT NULL,
	`cover_url` text DEFAULT '' NOT NULL,
	`page_count` integer DEFAULT 2 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
