CREATE TABLE IF NOT EXISTS `bank_research_reviewers` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bank_research_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`researcher_email` text NOT NULL,
	`researcher_name` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`institution_type` text DEFAULT '' NOT NULL,
	`status_recommendation` text DEFAULT 'unknown' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`public_comment` text DEFAULT '' NOT NULL,
	`last_updated` text DEFAULT '' NOT NULL,
	`full_report` text DEFAULT '' NOT NULL,
	`source_urls` text DEFAULT '' NOT NULL,
	`ownership_details` text DEFAULT '' NOT NULL,
	`iska_details` text DEFAULT '' NOT NULL,
	`internal_notes` text DEFAULT '' NOT NULL,
	`logo_key` text DEFAULT '' NOT NULL,
	`logo_name` text DEFAULT '' NOT NULL,
	`report_key` text DEFAULT '' NOT NULL,
	`report_name` text DEFAULT '' NOT NULL,
	`workflow_status` text DEFAULT 'Draft' NOT NULL,
	`review_notes` text DEFAULT '' NOT NULL,
	`reviewer_email` text DEFAULT '' NOT NULL,
	`reviewer_name` text DEFAULT '' NOT NULL,
	`reviewed_at` text DEFAULT '' NOT NULL,
	`published_bank_id` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`submitted_at` text DEFAULT '' NOT NULL,
	`approved_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `bank_research_submissions_reference_unique` ON `bank_research_submissions` (`reference`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bank_researchers` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
