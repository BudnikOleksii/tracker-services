CREATE TABLE "KnownDevice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"ipAddress" text NOT NULL,
	"userAgent" text NOT NULL,
	"firstSeenAt" timestamp (3) DEFAULT now() NOT NULL,
	"lastSeenAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "KnownDevice_userId_ipAddress_userAgent_unique" UNIQUE("userId","ipAddress","userAgent")
);
--> statement-breakpoint
CREATE TABLE "LoginAttempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"attemptedAt" timestamp (3) DEFAULT now() NOT NULL,
	"successful" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "KnownDevice" ADD CONSTRAINT "KnownDevice_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "LoginAttempt_userId_attemptedAt_idx" ON "LoginAttempt" USING btree ("userId","attemptedAt");