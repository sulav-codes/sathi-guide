/*
  Warnings:

  - You are about to drop the column `firstName` on the `admin_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `admin_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `guide_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `guide_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `tourist_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `tourist_profiles` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `admin_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `guide_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `tourist_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin_profiles" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "guide_profiles" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tourist_profiles" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "fullName" TEXT NOT NULL;
