/*
  Warnings:

  - Made the column `galleryGroupId` on table `BookingPhoto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BookingPhoto" ALTER COLUMN "galleryGroupId" SET NOT NULL;
