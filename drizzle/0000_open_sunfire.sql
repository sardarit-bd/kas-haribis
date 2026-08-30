CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donor_name` text NOT NULL,
	`email` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`dedication` text,
	`anonymous` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`topic` text NOT NULL,
	`question` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `questions_reference_unique` ON `questions` (`reference`);--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` text NOT NULL,
	`ad_type` text NOT NULL,
	`description` text,
	`phone` text,
	`image_key` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
