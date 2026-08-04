/*
  Warnings:

  - Added the required column `purpose` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadPurpose" AS ENUM ('AVATAR', 'DOCUMENT', 'EXPERIENCE');

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "purpose" "UploadPurpose" NOT NULL;
