-- AlterTable
ALTER TABLE "device_tokens" ADD COLUMN     "deviceId" TEXT;

-- CreateIndex
CREATE INDEX "device_tokens_deviceId_idx" ON "device_tokens"("deviceId");
