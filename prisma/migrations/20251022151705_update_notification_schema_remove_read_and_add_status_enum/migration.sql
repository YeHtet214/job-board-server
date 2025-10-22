/*
  Warnings:

  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotiStatus" AS ENUM ('PENDING', 'DELIVERED', 'READ');

-- DropIndex
DROP INDEX "Notification_userId_read_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "read",
ADD COLUMN     "status" "NotiStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");
