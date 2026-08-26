ALTER TABLE "agreements" ADD COLUMN "sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agreements" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "agreements" ADD COLUMN "terms" text;--> statement-breakpoint
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;