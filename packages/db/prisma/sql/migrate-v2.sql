-- Safe migration for existing RegulationChunk rows (pre db push)
-- Run automatically via scripts/deploy-vps.sh

ALTER TABLE "RegulationChunk"
  ADD COLUMN IF NOT EXISTS "chunkIndex" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "RegulationChunk"
  ADD COLUMN IF NOT EXISTS "contentHash" TEXT NOT NULL DEFAULT '';

ALTER TABLE "RegulationChunk"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "RegulationChunk"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL OR "updatedAt" < "createdAt";

UPDATE "RegulationChunk"
SET "contentHash" = LEFT(MD5("content"), 16)
WHERE "contentHash" = '' OR "contentHash" IS NULL;

-- User.passwordHash (auth)
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
