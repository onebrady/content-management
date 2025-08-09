-- Add statusOrder to Project for /projects board ordering and index for fast sorting per status
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "statusOrder" INTEGER NOT NULL DEFAULT 0;

-- Index to support ordering projects within a status
CREATE INDEX IF NOT EXISTS "Project_status_statusOrder_idx" ON "Project"("status", "statusOrder");


