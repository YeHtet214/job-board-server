/*
  Warnings:

  - The `size` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "size",
ADD COLUMN     "size" "CompanySize";
