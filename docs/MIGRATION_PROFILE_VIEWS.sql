-- Migration: Add profile_views table
-- Run this manually in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS "profile_views" (
  "id"             TEXT NOT NULL,
  "profileUserId"  TEXT NOT NULL,
  "viewerIp"       TEXT,
  "viewerUserId"   TEXT,
  "profileType"    TEXT NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "profile_views_profileUserId_fkey"
    FOREIGN KEY ("profileUserId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "profile_views_viewerUserId_fkey"
    FOREIGN KEY ("viewerUserId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "profile_views_profileUserId_createdAt_idx"
  ON "profile_views"("profileUserId", "createdAt");

CREATE INDEX IF NOT EXISTS "profile_views_viewerIp_profileUserId_createdAt_idx"
  ON "profile_views"("viewerIp", "profileUserId", "createdAt");
