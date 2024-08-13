/*
  Warnings:

  - Added the required column `orignalFileName` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "assets_fileName_key";

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "orignalFileName" TEXT NOT NULL;
