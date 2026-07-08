-- CreateEnum
CREATE TYPE "BookingPhotoCategory" AS ENUM ('BEFORE', 'AFTER', 'DAMAGE');

-- CreateTable
CREATE TABLE "BookingPhoto" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "category" "BookingPhotoCategory" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingPhoto_storagePath_key" ON "BookingPhoto"("storagePath");

-- CreateIndex
CREATE INDEX "BookingPhoto_bookingId_category_idx" ON "BookingPhoto"("bookingId", "category");

-- CreateIndex
CREATE INDEX "BookingPhoto_isPublished_category_createdAt_idx" ON "BookingPhoto"("isPublished", "category", "createdAt");

-- AddForeignKey
ALTER TABLE "BookingPhoto" ADD CONSTRAINT "BookingPhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
