-- Email lifecycle foundation: preferences + event log

CREATE TABLE IF NOT EXISTS "email_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "frequency" TEXT NOT NULL DEFAULT 'immediate',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_preferences_userId_category_key"
ON "email_preferences"("userId", "category");

CREATE INDEX IF NOT EXISTS "email_preferences_userId_idx"
ON "email_preferences"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'email_preferences_userId_fkey'
  ) THEN
    ALTER TABLE "email_preferences"
    ADD CONSTRAINT "email_preferences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "email_events" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "dedupeKey" TEXT,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),

  CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_events_userId_category_createdAt_idx"
ON "email_events"("userId", "category", "createdAt");

CREATE INDEX IF NOT EXISTS "email_events_email_template_createdAt_idx"
ON "email_events"("email", "template", "createdAt");

CREATE INDEX IF NOT EXISTS "email_events_dedupeKey_idx"
ON "email_events"("dedupeKey");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'email_events_userId_fkey'
  ) THEN
    ALTER TABLE "email_events"
    ADD CONSTRAINT "email_events_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;
