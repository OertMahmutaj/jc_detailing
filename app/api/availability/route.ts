// app/api/availability/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Expects "YYYY-MM-DD"

    if (!dateParam) {
      return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
    }

    // Capture bookings across a broad window around this day to account for all offsets
    const searchDate = new Date(`${dateParam}T00:00:00`);
    const padStart = new Date(searchDate.getTime() - 24 * 60 * 60 * 1000);
    const padEnd = new Date(searchDate.getTime() + 24 * 60 * 60 * 1000);

    const existingBookings = await prisma.booking.findMany({
      where: {
        dateTime: { gte: padStart, lte: padEnd },
        status: { not: "CANCELLED" }
      }
    });

    const blockedSlots: string[] = [];

    existingBookings.forEach((booking) => {
      const start = new Date(booking.dateTime);
      const end = new Date(booking.endTime);

      // Convert database timestamp to local Swiss date string components
      const localBookingDate = start.toLocaleDateString("en-CA", { timeZone: "Europe/Zurich" }); // Returns "YYYY-MM-DD"

      // Only evaluate booking slots if they actually map to the client's chosen local calendar day
      if (localBookingDate === dateParam) {
        const startStr = start.toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" });
        const endStr = end.toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" });

        const [startHour, startMin] = startStr.split(":").map(Number);
        const [endHour, endMin] = endStr.split(":").map(Number);

        const startTotalMinutes = startHour * 60 + startMin;
        const endTotalMinutes = endHour * 60 + endMin;

        for (let hour = 8; hour <= 20; hour++) {
          for (const minute of [0, 30]) {
            const slotTotalMinutes = hour * 60 + minute;
            
            if (slotTotalMinutes >= startTotalMinutes && slotTotalMinutes < endTotalMinutes) {
              const formattedSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
              if (!blockedSlots.includes(formattedSlot)) {
                blockedSlots.push(formattedSlot);
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ blockedSlots });
  } catch (error) {
    console.error("Availability calculation bug:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}