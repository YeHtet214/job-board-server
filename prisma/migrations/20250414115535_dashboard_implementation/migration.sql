/*
  Warnings:

  - The values [REVIEWED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED');
ALTER TABLE "JobApplication" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "JobApplication" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "JobApplication" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateTable
CREATE TABLE "JobView" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobView_userId_idx" ON "JobView"("userId");

-- CreateIndex
CREATE INDEX "JobView_jobId_idx" ON "JobView"("jobId");

-- CreateIndex
CREATE INDEX "JobView_createdAt_idx" ON "JobView"("createdAt");

-- AddForeignKey
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
