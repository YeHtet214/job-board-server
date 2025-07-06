/*
  Warnings:

  - Added the required column `foundedYear` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industry` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `acceptTerms` to the `JobApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobType" ADD VALUE 'INTERNSHIP';
ALTER TYPE "JobType" ADD VALUE 'REMOTE';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "foundedYear" TEXT NOT NULL,
ADD COLUMN     "size" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "industry" SET NOT NULL;

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "acceptTerms" BOOLEAN NOT NULL,
ADD COLUMN     "additionalInfo" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
