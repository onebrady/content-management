-- Fix ContentStatus enum to ensure IN_REVIEW is used consistently
-- This migration is critical for production deployment

-- First, update any content records that use IN_REVIEW status
UPDATE "Content" SET "status" = 'IN_REVIEW' WHERE "status" = 'PENDING';
UPDATE "ContentVersion" SET "status" = 'IN_REVIEW' WHERE "status" = 'PENDING';

-- No need to alter the enum type since the schema already uses IN_REVIEW
-- This migration ensures data consistency between schema and application code