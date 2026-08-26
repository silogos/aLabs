CREATE TYPE "public"."task_link_type" AS ENUM('blocks', 'blocked_by', 'relates_to');--> statement-breakpoint
CREATE TABLE "task_links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"type" "task_link_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_links" ADD CONSTRAINT "task_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_links" ADD CONSTRAINT "task_links_source_id_tasks_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_links" ADD CONSTRAINT "task_links_target_id_tasks_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "task_link_uniq" ON "task_links" USING btree ("source_id","target_id","type");--> statement-breakpoint
CREATE INDEX "task_link_project_source_idx" ON "task_links" USING btree ("project_id","source_id");--> statement-breakpoint
CREATE INDEX "task_link_project_target_idx" ON "task_links" USING btree ("project_id","target_id");