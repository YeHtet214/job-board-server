/*
  Warnings:

  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `Profile` table. All the data in the column will be lost.
  - Made the column `bio` on table `Profile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `education` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
DROP COLUMN "socialLinks",
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedInUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ALTER COLUMN "bio" SET NOT NULL,
DROP COLUMN "education",
ADD COLUMN     "education" JSONB NOT NULL,
DROP COLUMN "experience",
ADD COLUMN     "experience" JSONB NOT NULL;
