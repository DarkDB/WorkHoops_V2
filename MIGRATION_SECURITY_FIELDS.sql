-- =====================================================
-- MIGRATION: Add Security Fields + OTP Tokens
-- WorkHoops Security Update
-- Execute in Supabase SQL Editor
-- =====================================================

-- ========== 1. ADD SECURITY COLUMNS TO USERS ==========

-- Add passwordHash column
ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Add passwordUpdatedAt column
ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordUpdatedAt" TIMESTAMP;

-- Add failedLoginAttempts column with default
ALTER TABLE users ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER DEFAULT 0;

-- Add lockedUntil column
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP;

-- Add mustResetPassword column with default
ALTER TABLE users ADD COLUMN IF NOT EXISTS "mustResetPassword" BOOLEAN DEFAULT FALSE;

-- ========== 2. CREATE OTP_TOKENS TABLE ==========

CREATE TABLE IF NOT EXISTS otp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

-- Create indexes for otp_tokens
CREATE INDEX IF NOT EXISTS otp_tokens_user_id_idx ON otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS otp_tokens_expires_at_idx ON otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS otp_tokens_used_at_idx ON otp_tokens(used_at);

-- ========== 3. MARK LEGACY USERS FOR OTP MIGRATION ==========

-- Users without passwordHash need to go through OTP flow
UPDATE users 
SET "mustResetPassword" = TRUE 
WHERE "passwordHash" IS NULL;

-- ========== 4. VERIFY CHANGES ==========

-- Check users table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('passwordHash', 'passwordUpdatedAt', 'failedLoginAttempts', 'lockedUntil', 'mustResetPassword')
ORDER BY column_name;

-- Check otp_tokens table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'otp_tokens';

-- Count legacy users (need OTP migration)
SELECT COUNT(*) as legacy_users_count FROM users WHERE "passwordHash" IS NULL;

-- ========== 5. DONE ==========
-- After running this script:
-- 1. Run the set-admin-password.ts script to set admin password
-- 2. Legacy users will need to use /auth/otp to get an OTP and set their password
