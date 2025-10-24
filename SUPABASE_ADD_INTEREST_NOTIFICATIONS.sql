-- Create InterestNotification table
CREATE TABLE IF NOT EXISTS "interest_notifications" (
  "id" TEXT PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "interestedUserId" TEXT NOT NULL,
  "message" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT "interest_notifications_profileId_fkey" 
    FOREIGN KEY ("profileId") 
    REFERENCES "talent_profiles"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  CONSTRAINT "interest_notifications_interestedUserId_fkey" 
    FOREIGN KEY ("interestedUserId") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "interest_notifications_profileId_idx" ON "interest_notifications"("profileId");
CREATE INDEX IF NOT EXISTS "interest_notifications_interestedUserId_idx" ON "interest_notifications"("interestedUserId");
CREATE INDEX IF NOT EXISTS "interest_notifications_status_idx" ON "interest_notifications"("status");
CREATE INDEX IF NOT EXISTS "interest_notifications_createdAt_idx" ON "interest_notifications"("createdAt" DESC);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE "interest_notifications" ENABLE ROW LEVEL SECURITY;
