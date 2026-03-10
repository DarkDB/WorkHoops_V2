-- Phase 3: product coherence, funnel events and low-friction onboarding

ALTER TABLE "talent_profiles"
  ALTER COLUMN "birthDate" DROP NOT NULL;

CREATE TABLE "funnel_events" (
  "id" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "userId" TEXT,
  "role" TEXT,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "funnel_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "funnel_events_eventName_createdAt_idx" ON "funnel_events"("eventName", "createdAt");
CREATE INDEX "funnel_events_userId_createdAt_idx" ON "funnel_events"("userId", "createdAt");

ALTER TABLE "funnel_events"
  ADD CONSTRAINT "funnel_events_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
