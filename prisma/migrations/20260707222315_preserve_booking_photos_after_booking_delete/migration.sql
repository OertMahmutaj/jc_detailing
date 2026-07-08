-- DropForeignKey
ALTER TABLE "BookingPhoto" DROP CONSTRAINT "BookingPhoto_bookingId_fkey";

-- AlterTable
ALTER TABLE "BookingPhoto" ADD COLUMN     "galleryGroupId" TEXT,
ALTER COLUMN "bookingId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "BookingPhoto_galleryGroupId_category_sortOrder_idx" ON "BookingPhoto"("galleryGroupId", "category", "sortOrder");

-- AddForeignKey
ALTER TABLE "BookingPhoto" ADD CONSTRAINT "BookingPhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
