/*
  Warnings:

  - A unique constraint covering the columns `[fileName]` on the table `assets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileName` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "fileName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "assets_fileName_key" ON "assets"("fileName");
