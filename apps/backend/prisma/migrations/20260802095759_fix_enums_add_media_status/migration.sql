-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DELETED');

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "status" "MediaStatus" NOT NULL DEFAULT 'PENDING';
