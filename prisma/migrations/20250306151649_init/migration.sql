/*
  Warnings:

  - You are about to drop the column `companyId` on the `Job` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";

-- DropIndex
DROP INDEX "Job_companyId_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordExpiry" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;
