ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'de';

UPDATE "Invoice"
SET "status" = 'SENT'
WHERE "status" IN ('DRAFT', 'OVERDUE');

ALTER TABLE "Invoice"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";

CREATE TYPE "InvoiceStatus" AS ENUM ('SENT', 'PAID');

ALTER TABLE "Invoice"
  ALTER COLUMN "status" TYPE "InvoiceStatus"
  USING "status"::text::"InvoiceStatus";

DROP TYPE "InvoiceStatus_old";

ALTER TABLE "Invoice"
  ALTER COLUMN "status" SET DEFAULT 'SENT';
