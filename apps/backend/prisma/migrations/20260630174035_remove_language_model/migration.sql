/*
  Warnings:

  - You are about to drop the `guide_languages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `languages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "guide_languages" DROP CONSTRAINT "guide_languages_guideProfileId_fkey";

-- DropForeignKey
ALTER TABLE "guide_languages" DROP CONSTRAINT "guide_languages_languageId_fkey";

-- AlterTable
ALTER TABLE "guide_profiles" ADD COLUMN     "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "guide_languages";

-- DropTable
DROP TABLE "languages";

-- DropEnum
DROP TYPE "LanguageProficiency";
