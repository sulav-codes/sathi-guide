-- AlterEnum
ALTER TYPE "PricingUnit" ADD VALUE 'PER_GROUP';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "color" TEXT;
