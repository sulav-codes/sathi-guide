-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('USER', 'REVIEW', 'BOOKING', 'EXPERIENCE', 'MESSAGE', 'CONTENT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'SCAM', 'DISCRIMINATION', 'VIOLENCE', 'COPYRIGHT', 'PRIVACY', 'OTHER');

-- CreateEnum
CREATE TYPE "ResolutionAction" AS ENUM ('NO_ACTION', 'WARNING', 'CONTENT_REMOVED', 'SUSPENDED', 'BANNED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetReviewId" TEXT,
    "targetBookingId" TEXT,
    "targetExperienceId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "detail" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNote" TEXT,
    "resolutionAction" "ResolutionAction",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_targetType_targetId_idx" ON "reports"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "reports_targetUserId_idx" ON "reports"("targetUserId");

-- CreateIndex
CREATE INDEX "reports_targetReviewId_idx" ON "reports"("targetReviewId");

-- CreateIndex
CREATE INDEX "reports_targetBookingId_idx" ON "reports"("targetBookingId");

-- CreateIndex
CREATE INDEX "reports_targetExperienceId_idx" ON "reports"("targetExperienceId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "bookings_touristId_status_idx" ON "bookings"("touristId", "status");

-- CreateIndex
CREATE INDEX "bookings_experienceId_status_idx" ON "bookings"("experienceId", "status");

-- CreateIndex
CREATE INDEX "bookings_status_tripDate_idx" ON "bookings"("status", "tripDate");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_targetReviewId_fkey" FOREIGN KEY ("targetReviewId") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_targetBookingId_fkey" FOREIGN KEY ("targetBookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_targetExperienceId_fkey" FOREIGN KEY ("targetExperienceId") REFERENCES "experiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
