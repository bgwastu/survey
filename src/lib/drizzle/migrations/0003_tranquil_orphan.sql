ALTER TABLE `survey` RENAME COLUMN `background` TO `description`;--> statement-breakpoint
ALTER TABLE conversation ADD `fingerprint_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE survey ADD `target_audiences` text NOT NULL;--> statement-breakpoint
ALTER TABLE survey ADD `preferred_languages` text NOT NULL;--> statement-breakpoint
ALTER TABLE survey ADD `initial_form_json` text NOT NULL;