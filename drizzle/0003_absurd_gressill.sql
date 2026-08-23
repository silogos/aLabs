CREATE TABLE "task_comments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_label_links" DROP CONSTRAINT "task_label_links_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "task_label_links" DROP CONSTRAINT "task_label_links_label_id_task_labels_id_fk";
--> statement-breakpoint
ALTER TABLE "task_label_links" ALTER COLUMN "task_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_label_links" ALTER COLUMN "label_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "iterations" ADD COLUMN "committed_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "iterations" ADD COLUMN "completed_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "iterations" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "total_tasks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "done_tasks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "estimate" integer;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_comments_task_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
ALTER TABLE "task_label_links" ADD CONSTRAINT "task_label_links_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_label_links" ADD CONSTRAINT "task_label_links_label_id_task_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."task_labels"("id") ON DELETE cascade ON UPDATE no action;