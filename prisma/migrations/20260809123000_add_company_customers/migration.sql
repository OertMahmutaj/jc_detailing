CREATE TYPE "ClientType" AS ENUM ('PRIVATE', 'COMPANY');
CREATE TYPE "ServiceAudience" AS ENUM ('PRIVATE', 'COMPANY');

ALTER TABLE "Client"
ADD COLUMN "type" "ClientType" NOT NULL DEFAULT 'PRIVATE';

ALTER TABLE "Service"
ADD COLUMN "audience" "ServiceAudience" NOT NULL DEFAULT 'PRIVATE';

ALTER TABLE "Invoice"
ADD COLUMN "customerType" "ClientType" NOT NULL DEFAULT 'PRIVATE';

CREATE INDEX "Client_type_idx" ON "Client"("type");
CREATE INDEX "Service_audience_idx" ON "Service"("audience");
CREATE INDEX "Invoice_documentType_customerType_idx"
ON "Invoice"("documentType", "customerType");
