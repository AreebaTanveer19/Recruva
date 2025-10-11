-- /*
--   Warnings:

--   - The values [Pending] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
--   - You are about to drop the column `approvedBy` on the `Job` table. All the data in the column will be lost.
--   - You are about to drop the column `description` on the `Job` table. All the data in the column will be lost.
--   - You are about to drop the column `experienceLevel` on the `Job` table. All the data in the column will be lost.
--   - You are about to drop the column `qualifications` on the `Job` table. All the data in the column will be lost.
--   - You are about to drop the column `requirements` on the `Job` table. All the data in the column will be lost.
--   - You are about to drop the column `responsibilities` on the `Job` table. All the data in the column will be lost.
--   - You are about to drop the column `salaryMax` on the `Job` table. All the data in the column will be lost.
--   - You are about to drop the column `salaryMin` on the `Job` table. All the data in the column will be lost.

-- */
-- -- AlterEnum
-- BEGIN;
-- CREATE TYPE "public"."JobStatus_new" AS ENUM ('Open', 'Closed');
-- ALTER TABLE "public"."Job" ALTER COLUMN "status" DROP DEFAULT;
-- ALTER TABLE "public"."Job" ALTER COLUMN "status" TYPE "public"."JobStatus_new" USING ("status"::text::"public"."JobStatus_new");
-- ALTER TYPE "public"."JobStatus" RENAME TO "JobStatus_old";
-- ALTER TYPE "public"."JobStatus_new" RENAME TO "JobStatus";
-- DROP TYPE "public"."JobStatus_old";
-- ALTER TABLE "public"."Job" ALTER COLUMN "status" SET DEFAULT 'Open';
-- COMMIT;

-- -- DropForeignKey
-- ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_approvedBy_fkey";

-- -- AlterTable
-- ALTER TABLE "public"."Job" DROP COLUMN "approvedBy",
-- DROP COLUMN "description",
-- DROP COLUMN "experienceLevel",
-- DROP COLUMN "qualifications",
-- DROP COLUMN "requirements",
-- DROP COLUMN "responsibilities",
-- DROP COLUMN "salaryMax",
-- DROP COLUMN "salaryMin",
-- ALTER COLUMN "status" SET DEFAULT 'Open';

-- -- CreateTable
-- CREATE TABLE "public"."JobDetails" (
--     "jobId" INTEGER NOT NULL,
--     "description" TEXT NOT NULL,
--     "requirements" TEXT[],
--     "responsibilities" TEXT[],
--     "experienceLevel" INTEGER NOT NULL,
--     "salaryMin" INTEGER NOT NULL,
--     "salaryMax" INTEGER NOT NULL,

--     CONSTRAINT "JobDetails_pkey" PRIMARY KEY ("jobId")
-- );

-- -- CreateTable
-- CREATE TABLE "public"."_JobPosters" (
--     "A" INTEGER NOT NULL,
--     "B" INTEGER NOT NULL,

--     CONSTRAINT "_JobPosters_AB_pkey" PRIMARY KEY ("A","B")
-- );

-- -- CreateIndex
-- CREATE INDEX "_JobPosters_B_index" ON "public"."_JobPosters"("B");

-- -- AddForeignKey
-- ALTER TABLE "public"."JobDetails" ADD CONSTRAINT "JobDetails_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "public"."_JobPosters" ADD CONSTRAINT "_JobPosters_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "public"."_JobPosters" ADD CONSTRAINT "_JobPosters_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
/*
  Safe schema update for Job and related tables
  - Keeps "Pending" in JobStatus enum if you still need it
  - Moves job detail fields into JobDetails table
  - Maintains many-to-many relation for job posters
*/

-- Ensure enum includes all valid statuses
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jobstatus') THEN
    CREATE TYPE "public"."JobStatus" AS ENUM ('Open', 'Closed', 'Pending');
  ELSIF NOT EXISTS (SELECT 1 FROM unnest(enum_range(NULL::"public"."JobStatus")) e WHERE e = 'Pending') THEN
    ALTER TYPE "public"."JobStatus" ADD VALUE 'Pending';
  END IF;
END$$;

-- Safely drop old constraints (if exist)
DO $$
BEGIN
  ALTER TABLE "public"."Job" DROP CONSTRAINT IF EXISTS "Job_approvedBy_fkey";
EXCEPTION WHEN undefined_table THEN
  NULL;
END$$;

-- Create JobDetails table if not exists
CREATE TABLE IF NOT EXISTS "public"."JobDetails" (
    "jobId" INTEGER PRIMARY KEY,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "responsibilities" TEXT[],
    "experienceLevel" INTEGER NOT NULL,
    "salaryMin" INTEGER NOT NULL,
    "salaryMax" INTEGER NOT NULL,
    CONSTRAINT "JobDetails_jobId_fkey"
      FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create _JobPosters join table if not exists
CREATE TABLE IF NOT EXISTS "public"."_JobPosters" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_JobPosters_AB_pkey" PRIMARY KEY ("A","B"),
    CONSTRAINT "_JobPosters_A_fkey"
      FOREIGN KEY ("A") REFERENCES "public"."Job"("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_JobPosters_B_fkey"
      FOREIGN KEY ("B") REFERENCES "public"."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "_JobPosters_B_index" ON "public"."_JobPosters"("B");

-- Finally, update Job table defaults safely
ALTER TABLE "public"."Job"
ALTER COLUMN "status" SET DEFAULT 'Open';
