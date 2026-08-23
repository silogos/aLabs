ALTER TABLE "project_members" ALTER COLUMN "joined_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_members" ALTER COLUMN "joined_at" DROP NOT NULL;