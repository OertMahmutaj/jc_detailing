DO $$
DECLARE
  mapping TEXT[][];
  old_service_id TEXT;
  new_service_id TEXT;
BEGIN
  mapping := ARRAY[
    ARRAY['Innenreinigung komplett', 'Komplett Innenreinigung'],
    ARRAY['Aussenreinigung komplett', 'Komplett Aussenreinigung'],
    ARRAY['Keramikversiegelung', 'Keramik Versiegelung'],
    ARRAY['Complete Premium Paket', 'Komplette Premium Paket'],
    ARRAY['Komplett Aufbereitung', 'Komplette Premium Paket'],
    ARRAY['Politur & Keramik', 'Keramik Versiegelung']
  ];

  FOR i IN 1..array_length(mapping, 1) LOOP
    SELECT "id" INTO old_service_id FROM "Service" WHERE "name" = mapping[i][1] LIMIT 1;
    SELECT "id" INTO new_service_id FROM "Service" WHERE "name" = mapping[i][2] LIMIT 1;

    IF old_service_id IS NOT NULL AND new_service_id IS NULL THEN
      UPDATE "Service" SET "name" = mapping[i][2] WHERE "id" = old_service_id;
    ELSIF old_service_id IS NOT NULL AND new_service_id IS NOT NULL THEN
      UPDATE "Booking" SET "serviceId" = new_service_id WHERE "serviceId" = old_service_id;

      INSERT INTO "_BookingToServices" ("A", "B")
      SELECT "A", new_service_id
      FROM "_BookingToServices"
      WHERE "B" = old_service_id
      ON CONFLICT DO NOTHING;

      DELETE FROM "_BookingToServices" WHERE "B" = old_service_id;
      DELETE FROM "Service" WHERE "id" = old_service_id;
    END IF;
  END LOOP;

  DELETE FROM "Service"
  WHERE "name" NOT IN (
    'Komplett Innenreinigung',
    'Komplett Aussenreinigung',
    'Pflegeerhaltung Innenreinigung',
    'Pflegeerhaltung Aussenreinigung',
    'Polish Paket (1-Step)',
    'Polish Paket (2-Step)',
    'Keramik Versiegelung',
    'Komplette Premium Paket'
  )
  AND "id" NOT IN (SELECT "serviceId" FROM "Booking")
  AND "id" NOT IN (SELECT "B" FROM "_BookingToServices");
END $$;
