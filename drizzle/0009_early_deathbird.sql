CREATE TABLE "task_status_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"task_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"from_status" uuid,
	"to_status" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"actor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_status_events" ADD CONSTRAINT "task_status_events_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_status_events" ADD CONSTRAINT "task_status_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_status_events" ADD CONSTRAINT "task_status_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_status_events_project_at_idx" ON "task_status_events" USING btree ("project_id","occurred_at");--> statement-breakpoint
CREATE INDEX "task_status_events_task_at_idx" ON "task_status_events" USING btree ("task_id","occurred_at");--> statement-breakpoint

-- Backfill one synthetic initial-status event per pre-existing task at its
-- created_at into its current status. Idempotent + dedup-safe: tasks that
-- already have any event (e.g. inserted by the new repo hook before this
-- migration ran) are skipped. Covers dev DBs that predate the hook; fresh
-- seeds flow through taskRepo.insertTask and are covered automatically.
INSERT INTO "task_status_events" ("id", "task_id", "project_id", "from_status", "to_status", "occurred_at", "created_at")
SELECT gen_random_uuid(), t."id", t."project_id", NULL, t."status_id", t."created_at", now()
FROM "tasks" t
WHERE NOT EXISTS (SELECT e.task_id FROM "task_status_events" e WHERE e."task_id" = t."id");