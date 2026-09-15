CREATE TABLE "oauth_states" (
	"id" uuid PRIMARY KEY NOT NULL,
	"state" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_states_state_key" ON "oauth_states" USING btree ("state");