import { NextResponse } from "next/server";
import { prisma } from "../../(admin)/admin/_lib/prisma";

function isValidDateParam(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function buildSlotDate(date: string, slot: string) {
  return new Date(`${date}T${slot}:00`);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const durationParam = Number(searchParams.get("durationMinutes") ?? "30");
    const durationMinutes = Number.isFinite(durationParam)
      ? Math.max(30, Math.min(Math.round(durationParam), 60 * 24 * 7))
      : 30;

    if (!dateParam || !isValidDateParam(dateParam)) {
      return NextResponse.json({ error: "Missing or invalid date parameter" }, { status: 400 });
    }

    const dayStart = buildSlotDate(dateParam, "00:00");
    const latestPotentialEnd = new Date(buildSlotDate(dateParam, "19:30").getTime() + durationMinutes * 60000);

    const existingBookings = await prisma.booking.findMany({
      where: {
        status: { not: "CANCELLED" },
        dateTime: { lt: latestPotentialEnd },
        endTime: { gt: dayStart },
      },
      select: {
        dateTime: true,
        endTime: true,
      },
    });

    const availabilityBlocks = await prisma.availabilityBlock.findMany({
      where: {
        startTime: { lt: latestPotentialEnd },
        endTime: { gt: dayStart },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const blockedSlots: string[] = [];

    for (let hour = 8; hour <= 19; hour++) {
      for (const minute of [0, 30]) {
        const slot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotStart = buildSlotDate(dateParam, slot);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
        const hasBookingConflict = existingBookings.some((booking) =>
          overlaps(slotStart, slotEnd, new Date(booking.dateTime), new Date(booking.endTime))
        );
        const hasBlockedConflict = availabilityBlocks.some((block) =>
          overlaps(slotStart, slotEnd, new Date(block.startTime), new Date(block.endTime))
        );

        if (hasBookingConflict || hasBlockedConflict) {
          blockedSlots.push(slot);
        }
      }
    }

    return NextResponse.json({ blockedSlots });
  } catch (error) {
    console.error("Availability calculation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
