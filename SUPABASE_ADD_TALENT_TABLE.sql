-- WorkHoops - Add TalentProfile Table
-- Execute this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS talent_profiles (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3) NOT NULL,
  role TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'España' NOT NULL,
  position TEXT,
  height INTEGER,
  weight INTEGER,
  bio TEXT,
  "videoUrl" TEXT,
  "socialUrl" TEXT,
  "isPublic" BOOLEAN DEFAULT true NOT NULL,
  verified BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT UNIQUE NOT NULL,
  CONSTRAINT talent_profiles_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS talent_profiles_userId_idx ON talent_profiles("userId");
CREATE INDEX IF NOT EXISTS talent_profiles_role_idx ON talent_profiles(role);
CREATE INDEX IF NOT EXISTS talent_profiles_isPublic_idx ON talent_profiles("isPublic");
