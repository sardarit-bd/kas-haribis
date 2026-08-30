CREATE TABLE `member_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`member_email` text NOT NULL,
	`order_reference` text DEFAULT '' NOT NULL,
	`item_summary` text DEFAULT '' NOT NULL,
	`total_cents` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`newsletter` integer DEFAULT true NOT NULL,
	`ribbis_alerts` integer DEFAULT true NOT NULL,
	`discounts` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
