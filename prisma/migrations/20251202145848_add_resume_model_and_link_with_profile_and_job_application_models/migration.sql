/*
  Warnings:

  - You are about to drop the column `resumeUrl` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resumeFileId]` on the table `JobApplication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resumeFileId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "resumeUrl",
ADD COLUMN     "resumeFileId" TEXT;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "resumeUrl",
ADD COLUMN     "resumeFileId" TEXT;

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resume_fileId_key" ON "Resume"("fileId");

-- CreateIndex
CREATE INDEX "Resume_fileId_idx" ON "Resume"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_resumeFileId_key" ON "JobApplication"("resumeFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_resumeFileId_key" ON "Profile"("resumeFileId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_resumeFileId_fkey" FOREIGN KEY ("resumeFileId") REFERENCES "Resume"("fileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeFileId_fkey" FOREIGN KEY ("resumeFileId") REFERENCES "Resume"("fileId") ON DELETE CASCADE ON UPDATE CASCADE;
