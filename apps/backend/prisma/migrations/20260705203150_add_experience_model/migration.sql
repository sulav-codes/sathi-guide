/*
  Warnings:

  - You are about to drop the column `destinationId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `guideId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `meetingLocationId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the `booking_expertise_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guide_availability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guide_pricing_rules` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `experienceId` to the `availability_locks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experienceId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExperienceStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExperienceDifficulty" AS ENUM ('EASY', 'MODERATE', 'CHALLENGING', 'DIFFICULT');

-- DropForeignKey
ALTER TABLE "booking_expertise_tags" DROP CONSTRAINT "booking_expertise_tags_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "booking_expertise_tags" DROP CONSTRAINT "booking_expertise_tags_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "booking_pricing_snapshots" DROP CONSTRAINT "booking_pricing_snapshots_pricingRuleId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_destinationId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_guideId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_meetingLocationId_fkey";

-- DropForeignKey
ALTER TABLE "guide_availability" DROP CONSTRAINT "guide_availability_guideProfileId_fkey";

-- DropForeignKey
ALTER TABLE "guide_pricing_rules" DROP CONSTRAINT "guide_pricing_rules_guideProfileId_fkey";

-- DropIndex
DROP INDEX "bookings_guideId_idx";

-- DropIndex
DROP INDEX "bookings_meetingLocationId_idx";

-- AlterTable
ALTER TABLE "availability_locks" ADD COLUMN     "experienceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "destinationId",
DROP COLUMN "guideId",
DROP COLUMN "meetingLocationId",
ADD COLUMN     "experienceId" TEXT NOT NULL;

-- DropTable
DROP TABLE "booking_expertise_tags";

-- DropTable
DROP TABLE "guide_availability";

-- DropTable
DROP TABLE "guide_pricing_rules";

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "destinationId" TEXT,
    "locationId" TEXT NOT NULL,
    "meetingLocationId" TEXT,
    "difficulty" "ExperienceDifficulty",
    "durationHours" DECIMAL(5,2) NOT NULL,
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL,
    "languagesOffered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cancellationPolicy" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NPR',
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "status" "ExperienceStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coverImageId" TEXT,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_images" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experience_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_pricing_rules" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "PricingUnit" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NPR',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "minGroupSize" INTEGER,
    "maxGroupSize" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_availability" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "recurrenceEndsAt" DATE,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experience_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "experiences_slug_key" ON "experiences"("slug");

-- CreateIndex
CREATE INDEX "experiences_guideProfileId_idx" ON "experiences"("guideProfileId");

-- CreateIndex
CREATE INDEX "experiences_categoryId_idx" ON "experiences"("categoryId");

-- CreateIndex
CREATE INDEX "experiences_destinationId_idx" ON "experiences"("destinationId");

-- CreateIndex
CREATE INDEX "experiences_status_isActive_idx" ON "experiences"("status", "isActive");

-- CreateIndex
CREATE INDEX "experiences_slug_idx" ON "experiences"("slug");

-- CreateIndex
CREATE INDEX "experience_images_experienceId_idx" ON "experience_images"("experienceId");

-- CreateIndex
CREATE INDEX "experience_images_mediaId_idx" ON "experience_images"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "experience_images_experienceId_mediaId_key" ON "experience_images"("experienceId", "mediaId");

-- CreateIndex
CREATE INDEX "experience_pricing_rules_experienceId_isActive_idx" ON "experience_pricing_rules"("experienceId", "isActive");

-- CreateIndex
CREATE INDEX "experience_availability_experienceId_date_idx" ON "experience_availability"("experienceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "experience_availability_experienceId_date_startTime_key" ON "experience_availability"("experienceId", "date", "startTime");

-- CreateIndex
CREATE INDEX "availability_locks_experienceId_idx" ON "availability_locks"("experienceId");

-- CreateIndex
CREATE INDEX "bookings_experienceId_idx" ON "bookings"("experienceId");

-- AddForeignKey
ALTER TABLE "availability_locks" ADD CONSTRAINT "availability_locks_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "guide_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expertise_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_meetingLocationId_fkey" FOREIGN KEY ("meetingLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_images" ADD CONSTRAINT "experience_images_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_images" ADD CONSTRAINT "experience_images_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_pricing_rules" ADD CONSTRAINT "experience_pricing_rules_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_availability" ADD CONSTRAINT "experience_availability_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_pricing_snapshots" ADD CONSTRAINT "booking_pricing_snapshots_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "experience_pricing_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
