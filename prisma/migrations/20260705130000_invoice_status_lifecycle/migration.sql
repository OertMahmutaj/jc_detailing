ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";

CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');

ALTER TABLE "Invoice"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Invoice"
  ALTER COLUMN "status" TYPE "InvoiceStatus"
  USING (
    CASE "status"::text
      WHEN 'UNPAID' THEN 'SENT'
      ELSE "status"::text
    END
  )::"InvoiceStatus";

ALTER TABLE "Invoice"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

ALTER TABLE "Invoice"
  ADD COLUMN "sentAt" TIMESTAMP(3),
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "reminderSentAt" TIMESTAMP(3);

DROP TYPE "InvoiceStatus_old";
