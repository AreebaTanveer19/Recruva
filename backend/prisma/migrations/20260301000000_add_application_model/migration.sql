-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted');

-- AlterTable: Remove unique constraint and job_ID from Resume
ALTER TABLE "Resume" DROP CONSTRAINT IF EXISTS "Resume_candidateId_key";
ALTER TABLE "Resume" DROP CONSTRAINT IF EXISTS "Resume_job_ID_key";
ALTER TABLE "Resume" DROP CONSTRAINT IF EXISTS "Resume_Job_fkey";
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "job_ID";
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "filename";
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "mimeType";
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "size";

-- DropForeignKey (old Resume -> Job relation on Job side)
ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_Resume_fkey";

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_candidateId_jobId_key" ON "Application"("candidateId", "jobId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
