CREATE TYPE "BillingDocumentType" AS ENUM ('INVOICE', 'RECEIPT');

ALTER TABLE "Invoice"
ADD COLUMN "documentType" "BillingDocumentType" NOT NULL DEFAULT 'INVOICE',
ADD COLUMN "receiptBookingId" TEXT;

CREATE UNIQUE INDEX "Invoice_receiptBookingId_key"
ON "Invoice"("receiptBookingId");

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_receiptBookingId_fkey"
FOREIGN KEY ("receiptBookingId") REFERENCES "Booking"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
