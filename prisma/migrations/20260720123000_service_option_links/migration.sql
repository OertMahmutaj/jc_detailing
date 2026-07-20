ALTER TABLE "VehicleCategory"
  ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "AddOn"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "ServiceVehicleCategory" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "vehicleCategoryId" TEXT NOT NULL,
  "priceModifier" DOUBLE PRECISION NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ServiceVehicleCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceAddOn" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "addOnId" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "additionalDuration" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ServiceAddOn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceVehicleCategory_serviceId_vehicleCategoryId_key"
  ON "ServiceVehicleCategory"("serviceId", "vehicleCategoryId");

CREATE INDEX IF NOT EXISTS "ServiceVehicleCategory_vehicleCategoryId_idx"
  ON "ServiceVehicleCategory"("vehicleCategoryId");

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceAddOn_serviceId_addOnId_key"
  ON "ServiceAddOn"("serviceId", "addOnId");

CREATE INDEX IF NOT EXISTS "ServiceAddOn_addOnId_idx"
  ON "ServiceAddOn"("addOnId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ServiceVehicleCategory_serviceId_fkey'
  ) THEN
    ALTER TABLE "ServiceVehicleCategory"
      ADD CONSTRAINT "ServiceVehicleCategory_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "Service"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ServiceVehicleCategory_vehicleCategoryId_fkey'
  ) THEN
    ALTER TABLE "ServiceVehicleCategory"
      ADD CONSTRAINT "ServiceVehicleCategory_vehicleCategoryId_fkey"
      FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ServiceAddOn_serviceId_fkey'
  ) THEN
    ALTER TABLE "ServiceAddOn"
      ADD CONSTRAINT "ServiceAddOn_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "Service"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ServiceAddOn_addOnId_fkey'
  ) THEN
    ALTER TABLE "ServiceAddOn"
      ADD CONSTRAINT "ServiceAddOn_addOnId_fkey"
      FOREIGN KEY ("addOnId") REFERENCES "AddOn"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

UPDATE "VehicleCategory"
SET "imageUrl" = CASE "name"
  WHEN 'City Car' THEN '/city_car.webp'
  WHEN 'Sedan' THEN '/sedan.webp'
  WHEN 'Sports Car' THEN '/sports_car.webp'
  WHEN 'SUV' THEN '/suv.webp'
  WHEN 'Van' THEN '/van.webp'
  ELSE "imageUrl"
END
WHERE "imageUrl" IS NULL;

INSERT INTO "ServiceVehicleCategory" (
  "id",
  "serviceId",
  "vehicleCategoryId",
  "priceModifier",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  'svcveh_' || md5(s."id" || ':' || vc."id"),
  s."id",
  vc."id",
  vc."priceModifier",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Service" s
CROSS JOIN "VehicleCategory" vc
ON CONFLICT ("serviceId", "vehicleCategoryId") DO NOTHING;

INSERT INTO "ServiceAddOn" (
  "id",
  "serviceId",
  "addOnId",
  "price",
  "additionalDuration",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  'svcaddon_' || md5(s."id" || ':' || a."id"),
  s."id",
  a."id",
  a."price",
  a."additionalDuration",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Service" s
JOIN "AddOn" a ON (
  (s."name" = 'Komplette Innenreinigung' AND a."name" = 'Tierhaarentfernung')
  OR (
    s."name" = 'Pflegeerhaltung Innenreinigung'
    AND a."name" IN (
      'Tierhaarentfernung',
      'Sitze Tiefenreinigung',
      'Fussmatten intensiv',
      'Kofferraum Deep Clean'
    )
  )
  OR (s."name" = 'Komplette Premium Paket' AND a."name" = 'Tierhaarentfernung')
)
ON CONFLICT ("serviceId", "addOnId") DO NOTHING;
