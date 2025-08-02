/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "slug" TEXT;

-- Update existing records with generated slugs
UPDATE "Content" 
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("title", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-')) || '-' || "id"
WHERE "slug" IS NULL;

-- Make slug NOT NULL after updating existing records
ALTER TABLE "Content" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");
