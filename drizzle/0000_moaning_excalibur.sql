CREATE TABLE `legal_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`booking_reference` text,
	`message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legal_requests_code_unique` ON `legal_requests` (`code`);