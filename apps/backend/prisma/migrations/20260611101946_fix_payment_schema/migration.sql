/*
  Warnings:

  - The `currency` column on the `booking_pricing_snapshots` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "booking_pricing_snapshots" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'NPR';

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'NPR';

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'NPR';
