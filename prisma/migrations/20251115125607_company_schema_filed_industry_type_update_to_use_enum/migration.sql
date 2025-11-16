/*
  Warnings:

  - Changed the type of `industry` on the `Company` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Hospitality', 'Media', 'Transportation', 'Construction');

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "industry",
ADD COLUMN     "industry" "Industry" NOT NULL;
