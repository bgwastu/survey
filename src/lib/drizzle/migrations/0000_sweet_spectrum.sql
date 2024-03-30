CREATE TABLE `conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`survey_id` text,
	`summary` text NOT NULL,
	`chat_history_json` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`survey_id`) REFERENCES `survey`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `survey` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`background` text NOT NULL,
	`objectives` text NOT NULL,
	`created_at` text
);
