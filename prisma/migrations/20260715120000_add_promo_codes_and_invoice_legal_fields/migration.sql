-- Keep VAT available for future use while defaulting new invoices to zero.
ALTER TABLE "Invoice" ALTER COLUMN "vatRate" SET DEFAULT 0;

ALTER TABLE "Client" ADD COLUMN "address" TEXT;

CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountPercent" DOUBLE PRECISION NOT NULL,
  "maxUses" INTEGER NOT NULL,
  "maxUsesPerClient" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE INDEX "PromoCode_isActive_expiresAt_idx" ON "PromoCode"("isActive", "expiresAt");

ALTER TABLE "Booking"
  ADD COLUMN "promoCodeId" TEXT,
  ADD COLUMN "promoDiscountPercent" DOUBLE PRECISION,
  ADD COLUMN "promoDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE TABLE "PromoCodeUsage" (
  "id" TEXT NOT NULL,
  "promoCodeId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "discountPercent" DOUBLE PRECISION NOT NULL,
  "discountAmount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoCodeUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCodeUsage_bookingId_key" ON "PromoCodeUsage"("bookingId");
CREATE INDEX "PromoCodeUsage_promoCodeId_clientId_idx" ON "PromoCodeUsage"("promoCodeId", "clientId");
CREATE INDEX "Booking_promoCodeId_idx" ON "Booking"("promoCodeId");

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_promoCodeId_fkey"
  FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PromoCodeUsage"
  ADD CONSTRAINT "PromoCodeUsage_promoCodeId_fkey"
  FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PromoCodeUsage_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PromoCodeUsage_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice"
  ADD COLUMN "clientAddress" TEXT,
  ADD COLUMN "businessAddress" TEXT NOT NULL DEFAULT 'Sternmatt 4, 6242 Wauwil',
  ADD COLUMN "serviceDate" TIMESTAMP(3),
  ADD COLUMN "promoCode" TEXT,
  ADD COLUMN "promoDiscountPercent" DOUBLE PRECISION,
  ADD COLUMN "promoDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
