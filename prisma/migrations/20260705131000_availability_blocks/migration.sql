CREATE TABLE "AvailabilityBlock" (
  "id" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "fullDay" BOOLEAN NOT NULL DEFAULT false,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AvailabilityBlock_startTime_endTime_idx" ON "AvailabilityBlock"("startTime", "endTime");
