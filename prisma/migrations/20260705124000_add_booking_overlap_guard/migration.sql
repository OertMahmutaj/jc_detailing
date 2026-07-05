UPDATE "Booking" later_booking
SET "status" = 'CANCELLED'
FROM "Booking" earlier_booking
WHERE later_booking."id" <> earlier_booking."id"
  AND later_booking."status" <> 'CANCELLED'
  AND earlier_booking."status" <> 'CANCELLED'
  AND tsrange(later_booking."dateTime", later_booking."endTime", '[)') &&
      tsrange(earlier_booking."dateTime", earlier_booking."endTime", '[)')
  AND (
    earlier_booking."createdAt" < later_booking."createdAt"
    OR (
      earlier_booking."createdAt" = later_booking."createdAt"
      AND earlier_booking."id" < later_booking."id"
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Booking_no_active_time_overlap'
  ) THEN
    ALTER TABLE "Booking"
      ADD CONSTRAINT "Booking_no_active_time_overlap"
      EXCLUDE USING gist (
        tsrange("dateTime", "endTime", '[)') WITH &&
      )
      WHERE ("status" <> 'CANCELLED');
  END IF;
END $$;
