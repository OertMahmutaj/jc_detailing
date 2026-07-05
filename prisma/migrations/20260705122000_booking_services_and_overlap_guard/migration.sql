CREATE TABLE IF NOT EXISTS "_BookingToServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BookingToServices_AB_pkey" PRIMARY KEY ("A", "B")
);

CREATE INDEX IF NOT EXISTS "_BookingToServices_B_index" ON "_BookingToServices"("B");

ALTER TABLE "_BookingToServices"
  ADD CONSTRAINT "_BookingToServices_A_fkey"
  FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_BookingToServices"
  ADD CONSTRAINT "_BookingToServices_B_fkey"
  FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_BookingToServices" ("A", "B")
SELECT "id", "serviceId"
FROM "Booking"
ON CONFLICT DO NOTHING;

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
