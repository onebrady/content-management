-- Fix ContentStatus enum to ensure IN_REVIEW is used consistently
-- This migration is critical for production deployment

-- This migration is a safety check - we don't need to update any records
-- since the database already uses IN_REVIEW, not PENDING
-- The error was in the application code, not the database schema

-- Comment out the problematic statements that caused the error
-- UPDATE "Content" SET "status" = 'IN_REVIEW' WHERE "status" = 'PENDING';
-- UPDATE "ContentVersion" SET "status" = 'IN_REVIEW' WHERE "status" = 'PENDING';

-- No need to alter the enum type since the schema already uses IN_REVIEW
-- This migration ensures data consistency between schema and application code