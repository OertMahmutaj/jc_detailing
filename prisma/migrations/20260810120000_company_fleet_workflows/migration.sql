CREATE TYPE "CompanyContactRole" AS ENUM ('BOOKING', 'BILLING', 'OPERATIONS');
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

ALTER TABLE "Client"
  ADD COLUMN "paymentTermsDays" INTEGER NOT NULL DEFAULT 30;

CREATE TABLE "CompanyVehicle" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "licensePlate" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "vehicleCategoryId" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyVehicle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyContact" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "role" "CompanyContactRole" NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyServicePrice" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyServicePrice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecurringBookingSeries" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "companyVehicleId" TEXT,
  "serviceId" TEXT NOT NULL,
  "vehicleCategoryId" TEXT NOT NULL,
  "frequency" "RecurrenceFrequency" NOT NULL,
  "interval" INTEGER NOT NULL DEFAULT 1,
  "startDate" TIMESTAMP(3) NOT NULL,
  "untilDate" TIMESTAMP(3) NOT NULL,
  "startTimeMinutes" INTEGER NOT NULL,
  "notes" TEXT,
  "orderNumber" TEXT,
  "costCenter" TEXT,
  "internalReference" TEXT,
  "serviceLocation" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecurringBookingSeries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_AddOnToRecurringBookingSeries" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

ALTER TABLE "Booking"
  ADD COLUMN "collectiveInvoiceId" TEXT,
  ADD COLUMN "companyVehicleId" TEXT,
  ADD COLUMN "recurringSeriesId" TEXT,
  ADD COLUMN "orderNumber" TEXT,
  ADD COLUMN "costCenter" TEXT,
  ADD COLUMN "internalReference" TEXT,
  ADD COLUMN "serviceLocation" TEXT,
  ADD COLUMN "agreedBasePrice" DOUBLE PRECISION,
  ADD COLUMN "agreedTotalAmount" DOUBLE PRECISION;

ALTER TABLE "Invoice"
  ADD COLUMN "clientId" TEXT,
  ADD COLUMN "billingContactId" TEXT,
  ADD COLUMN "orderNumber" TEXT,
  ADD COLUMN "costCenter" TEXT,
  ADD COLUMN "internalReference" TEXT,
  ADD COLUMN "serviceLocation" TEXT,
  ADD COLUMN "periodStart" TIMESTAMP(3),
  ADD COLUMN "periodEnd" TIMESTAMP(3),
  ADD COLUMN "isCollective" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "paymentTermsDays" INTEGER NOT NULL DEFAULT 30;

CREATE UNIQUE INDEX "CompanyVehicle_clientId_licensePlate_key" ON "CompanyVehicle"("clientId", "licensePlate");
CREATE INDEX "CompanyVehicle_clientId_isActive_idx" ON "CompanyVehicle"("clientId", "isActive");
CREATE INDEX "CompanyContact_clientId_role_isActive_idx" ON "CompanyContact"("clientId", "role", "isActive");
CREATE UNIQUE INDEX "CompanyServicePrice_clientId_serviceId_key" ON "CompanyServicePrice"("clientId", "serviceId");
CREATE INDEX "CompanyServicePrice_serviceId_idx" ON "CompanyServicePrice"("serviceId");
CREATE INDEX "RecurringBookingSeries_clientId_isActive_idx" ON "RecurringBookingSeries"("clientId", "isActive");
CREATE UNIQUE INDEX "_AddOnToRecurringBookingSeries_AB_unique" ON "_AddOnToRecurringBookingSeries"("A", "B");
CREATE INDEX "_AddOnToRecurringBookingSeries_B_index" ON "_AddOnToRecurringBookingSeries"("B");
CREATE INDEX "Booking_companyVehicleId_idx" ON "Booking"("companyVehicleId");
CREATE INDEX "Booking_recurringSeriesId_idx" ON "Booking"("recurringSeriesId");
CREATE INDEX "Booking_collectiveInvoiceId_idx" ON "Booking"("collectiveInvoiceId");
CREATE INDEX "Invoice_clientId_isCollective_idx" ON "Invoice"("clientId", "isCollective");
CREATE INDEX "Invoice_billingContactId_idx" ON "Invoice"("billingContactId");

ALTER TABLE "CompanyVehicle" ADD CONSTRAINT "CompanyVehicle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyVehicle" ADD CONSTRAINT "CompanyVehicle_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompanyContact" ADD CONSTRAINT "CompanyContact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyServicePrice" ADD CONSTRAINT "CompanyServicePrice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyServicePrice" ADD CONSTRAINT "CompanyServicePrice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringBookingSeries" ADD CONSTRAINT "RecurringBookingSeries_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringBookingSeries" ADD CONSTRAINT "RecurringBookingSeries_companyVehicleId_fkey" FOREIGN KEY ("companyVehicleId") REFERENCES "CompanyVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RecurringBookingSeries" ADD CONSTRAINT "RecurringBookingSeries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecurringBookingSeries" ADD CONSTRAINT "RecurringBookingSeries_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "_AddOnToRecurringBookingSeries" ADD CONSTRAINT "_AddOnToRecurringBookingSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "AddOn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_AddOnToRecurringBookingSeries" ADD CONSTRAINT "_AddOnToRecurringBookingSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "RecurringBookingSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_collectiveInvoiceId_fkey" FOREIGN KEY ("collectiveInvoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_companyVehicleId_fkey" FOREIGN KEY ("companyVehicleId") REFERENCES "CompanyVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_recurringSeriesId_fkey" FOREIGN KEY ("recurringSeriesId") REFERENCES "RecurringBookingSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_billingContactId_fkey" FOREIGN KEY ("billingContactId") REFERENCES "CompanyContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
