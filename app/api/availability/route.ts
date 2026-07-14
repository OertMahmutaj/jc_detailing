import { NextResponse } from "next/server";
import { prisma } from "../../(admin)/admin/_lib/prisma";

export const dynamic = "force-dynamic";

const TIME_ZONE = "Europe/Zurich";

function isValidDateParam(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return representedAsUtc - date.getTime();
}

function buildZurichDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const wallTimeAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
  );

  let offset = getTimeZoneOffsetMs(
    new Date(wallTimeAsUtc),
    TIME_ZONE,
  );

  let result = new Date(wallTimeAsUtc - offset);

  // Correct the offset around daylight-saving transitions.
  const correctedOffset = getTimeZoneOffsetMs(result, TIME_ZONE);

  if (correctedOffset !== offset) {
    offset = correctedOffset;
    result = new Date(wallTimeAsUtc - offset);
  }

  return result;
}

function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) {
  return startA < endB && endA > startB;
}

function generatePublicTimeSlots() {
  const slots: string[] = [];

  for (let hour = 8; hour <= 13; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  return slots;
}

const PUBLIC_TIME_SLOTS = generatePublicTimeSlots();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const dateParam = searchParams.get("date");

    const durationParam = Number(
      searchParams.get("durationMinutes") ?? "30",
    );

    const durationMinutes = Number.isFinite(durationParam)
      ? Math.max(
          30,
          Math.min(Math.round(durationParam), 60 * 24 * 7),
        )
      : 30;

    if (!dateParam || !isValidDateParam(dateParam)) {
      return NextResponse.json(
        {
          error: "Missing or invalid date parameter",
          blockedSlots: [],
        },
        { status: 400 },
      );
    }

    const dayStart = buildZurichDate(dateParam, "00:00");

    const lastStartTime = buildZurichDate(dateParam, "13:30");

    const latestPotentialEnd = new Date(
      lastStartTime.getTime() + durationMinutes * 60_000,
    );

    const [existingBookings, availabilityBlocks] =
      await Promise.all([
        prisma.booking.findMany({
          where: {
            status: {
              not: "CANCELLED",
            },
            dateTime: {
              lt: latestPotentialEnd,
            },
            endTime: {
              gt: dayStart,
            },
          },
          select: {
            dateTime: true,
            endTime: true,
          },
        }),

        prisma.availabilityBlock.findMany({
          where: {
            startTime: {
              lt: latestPotentialEnd,
            },
            endTime: {
              gt: dayStart,
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        }),
      ]);

    const blockedSlots = PUBLIC_TIME_SLOTS.filter((slot) => {
      const slotStart = buildZurichDate(dateParam, slot);

      const slotEnd = new Date(
        slotStart.getTime() + durationMinutes * 60_000,
      );

      const hasBookingConflict = existingBookings.some(
        (booking) =>
          overlaps(
            slotStart,
            slotEnd,
            booking.dateTime,
            booking.endTime,
          ),
      );

      const hasBlockedConflict = availabilityBlocks.some(
        (block) =>
          overlaps(
            slotStart,
            slotEnd,
            block.startTime,
            block.endTime,
          ),
      );

      return hasBookingConflict || hasBlockedConflict;
    });

    return NextResponse.json(
      { blockedSlots },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Availability calculation failed:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        blockedSlots: [],
      },
      { status: 500 },
    );
  }
}