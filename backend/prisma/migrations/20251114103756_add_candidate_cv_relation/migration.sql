/*
  Warnings:

  - You are about to drop the column `email` on the `CvData` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `CvData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[candidateId]` on the table `CvData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `candidateId` to the `CvData` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."CvData_email_key";

-- AlterTable
ALTER TABLE "public"."CvData" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "candidateId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CvData_candidateId_key" ON "public"."CvData"("candidateId");

-- AddForeignKey
ALTER TABLE "public"."CvData" ADD CONSTRAINT "CvData_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
