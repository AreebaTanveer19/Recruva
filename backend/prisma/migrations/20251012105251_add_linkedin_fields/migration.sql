-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "linkedinExpires" TIMESTAMP(3),
ADD COLUMN     "linkedinId" TEXT,
ADD COLUMN     "linkedinToken" TEXT;
