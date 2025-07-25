/*
  Warnings:

  - You are about to drop the column `participation` on the `QuarterlyReport` table. All the data in the column will be lost.
  - Changed the type of `challenges` on the `QuarterlyReport` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "QuarterlyReport" DROP COLUMN "participation",
DROP COLUMN "challenges",
ADD COLUMN     "challenges" JSONB NOT NULL;
