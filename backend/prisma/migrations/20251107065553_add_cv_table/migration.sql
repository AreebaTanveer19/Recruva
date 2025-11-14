-- CreateTable
CREATE TABLE "public"."CvData" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "education" JSONB,
    "work_experience" JSONB,
    "skills" TEXT[],
    "projects" JSONB,
    "certifications" JSONB,

    CONSTRAINT "CvData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CvData_email_key" ON "public"."CvData"("email");
