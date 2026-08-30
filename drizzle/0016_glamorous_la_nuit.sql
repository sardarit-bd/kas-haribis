CREATE TABLE `bank_researcher_credentials` (
	`email` text PRIMARY KEY NOT NULL,
	`code_salt` text NOT NULL,
	`code_hash` text NOT NULL,
	`access_type` text DEFAULT 'permanent' NOT NULL,
	`expires_at` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
