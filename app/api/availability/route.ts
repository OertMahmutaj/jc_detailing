import { NextResponse } from "next/server";
import { prisma } from "../../(admin)/admin/_lib/prisma";
import {
  buildZurichDate,
  calculateServerBookingEnd,
  getServerScheduleHorizonEnd,
  isDateInsideScheduleBlock,
  overlaps,
} from "../../lib/bookingServerTime";

export const dynamic = "force-dynamic";

function isValidDateParam(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
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

function monthDateString(year: number, month: number, day: number) {
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function getBlockedSlotsForDate({
  availabilityBlocks,
  dateParam,
  durationMinutes,
  existingBookings,
}: {
  availabilityBlocks: Array<{ startTime: Date; endTime: Date }>;
  dateParam: string;
  durationMinutes: number;
  existingBookings: Array<{ dateTime: Date; endTime: Date }>;
}) {
  return PUBLIC_TIME_SLOTS.filter((slot) => {
    const slotStart = buildZurichDate(dateParam, slot);
    const slotEnd = calculateServerBookingEnd(
      slotStart,
      durationMinutes,
      availabilityBlocks,
    );

    if (!slotEnd || isDateInsideScheduleBlock(slotStart, availabilityBlocks)) {
      return true;
    }

    return existingBookings.some((booking) =>
      overlaps(slotStart, slotEnd, booking.dateTime, booking.endTime),
    );
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month");

    const durationParam = Number(
      searchParams.get("durationMinutes") ?? "30",
    );

    const durationMinutes = Number.isFinite(durationParam)
      ? Math.max(
          30,
          Math.min(Math.round(durationParam), 60 * 24 * 7),
        )
      : 30;

    if (monthParam) {
      const [yearValue, monthValue] = monthParam.split("-");
      const year = Number(yearValue);
      const month = Number(monthValue);

      if (
        !/^\d{4}-\d{2}$/.test(monthParam) ||
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
      ) {
        return NextResponse.json(
          {
            error: "Missing or invalid month parameter",
            fullyBookedDates: [],
          },
          { status: 400 },
        );
      }

      const totalDays = new Date(year, month, 0).getDate();
      const monthStartDate = monthDateString(year, month, 1);
      const monthEndDate = monthDateString(year, month, totalDays);
      const monthStart = buildZurichDate(monthStartDate, "00:00");
      const monthLastPublicStart = buildZurichDate(monthEndDate, "13:30");
      const monthHorizonEnd = getServerScheduleHorizonEnd(
        monthLastPublicStart,
        durationMinutes,
      );

      const [existingBookings, availabilityBlocks] = await Promise.all([
        prisma.booking.findMany({
          where: {
            status: {
              not: "CANCELLED",
            },
            dateTime: {
              lt: monthHorizonEnd,
            },
            endTime: {
              gt: monthStart,
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
              lt: monthHorizonEnd,
            },
            endTime: {
              gt: monthStart,
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        }),
      ]);

      const fullyBookedDates = Array.from({ length: totalDays }, (_, index) => {
        const dateString = monthDateString(year, month, index + 1);
        const blockedSlots = getBlockedSlotsForDate({
          availabilityBlocks,
          dateParam: dateString,
          durationMinutes,
          existingBookings,
        });

        return blockedSlots.length === PUBLIC_TIME_SLOTS.length
          ? dateString
          : null;
      }).filter((dateString): dateString is string => Boolean(dateString));

      return NextResponse.json(
        { fullyBookedDates },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
    }

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
    const scheduleHorizonEnd = getServerScheduleHorizonEnd(
      lastStartTime,
      durationMinutes,
    );

    const [existingBookings, availabilityBlocks] =
      await Promise.all([
        prisma.booking.findMany({
          where: {
            status: {
              not: "CANCELLED",
            },
            dateTime: {
              lt: scheduleHorizonEnd,
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
              lt: scheduleHorizonEnd,
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

    const blockedSlots = getBlockedSlotsForDate({
      availabilityBlocks,
      dateParam,
      durationMinutes,
      existingBookings,
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
