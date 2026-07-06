import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";
import { AdminCalendarClient } from "./AdminCalendarClient";
import { createAdminBooking } from "../_actions/bookingActions";

function buildDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

async function createAvailabilityBlock(formData: FormData) {
  "use server";

  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "08:00");
  const end = String(formData.get("end") ?? "19:30");
  const reason = String(formData.get("reason") ?? "").trim();
  const fullDay = formData.get("fullDay") === "on";

  if (!date) return;

  const startTime = fullDay ? buildDateTime(date, "00:00") : buildDateTime(date, start);
  const endTime = fullDay ? buildDateTime(date, "23:59") : buildDateTime(date, end);

  if (endTime <= startTime) return;

  await prisma.availabilityBlock.create({
    data: {
      endTime,
      fullDay,
      reason: reason || null,
      startTime,
    },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
}

async function deleteAvailabilityBlock(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.availabilityBlock.delete({ where: { id } });
  revalidatePath("/admin/calendar");
}

async function updateBookingSchedule(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  "use server";

  try {
    const id = String(formData.get("id") ?? "");
    const date = String(formData.get("date") ?? "");
    const start = String(formData.get("start") ?? "");
    const end = String(formData.get("end") ?? "");

    if (!id || !date || !start || !end) {
      return {
        success: false,
        error: "Bitte fülle Datum, Startzeit und Endzeit aus.",
      };
    }

    const dateTime = buildDateTime(date, start);
    const endTime = buildDateTime(date, end);

    if (
      Number.isNaN(dateTime.getTime()) ||
      Number.isNaN(endTime.getTime())
    ) {
      return {
        success: false,
        error: "Datum oder Uhrzeit ist ungültig.",
      };
    }

    if (endTime <= dateTime) {
      return {
        success: false,
        error: "Die Endzeit muss nach der Startzeit liegen.",
      };
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        id: {
          not: id,
        },
        status: {
          not: "CANCELLED",
        },
        dateTime: {
          lt: endTime,
        },
        endTime: {
          gt: dateTime,
        },
      },
      select: {
        dateTime: true,
        endTime: true,
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    if (conflictingBooking) {
      const formatter = new Intl.DateTimeFormat("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      });

      const conflictStart = formatter.format(conflictingBooking.dateTime);
      const conflictEnd = formatter.format(conflictingBooking.endTime);

      return {
        success: false,
        error: `Dieser Zeitraum ist bereits belegt: ${conflictStart}–${conflictEnd} Uhr (${conflictingBooking.client.name}).`,
      };
    }

    await prisma.booking.update({
      where: { id },
      data: {
        dateTime,
        endTime,
      },
    });

    revalidatePath("/admin/calendar");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Calendar booking update failed:", error);

    return {
      success: false,
      error: "Die Buchung konnte nicht gespeichert werden.",
    };
  }
}

async function cancelBooking(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  "use server";

  try {
    const id = String(formData.get("id") ?? "");

    if (!id) {
      return {
        success: false,
        error: "Die Buchung wurde nicht gefunden.",
      };
    }

    await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    revalidatePath("/admin/calendar");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Booking cancellation failed:", error);

    return {
      success: false,
      error: "Die Buchung konnte nicht storniert werden.",
    };
  }
}

export default async function AdminCalendarPage() {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 13, 0, 23, 59, 59);

  const bookings = await prisma.booking.findMany({
    include: {
      addOns: true,
      client: true,
      service: true,
      vehicleCategory: true,
    },
    orderBy: { dateTime: "asc" },
    where: {
      dateTime: { gte: rangeStart, lte: rangeEnd },
      status: { not: "CANCELLED" },
    },
  });
  const blocks = await prisma.availabilityBlock.findMany({
    orderBy: { startTime: "asc" },
    where: {
      startTime: { lte: rangeEnd },
      endTime: { gte: rangeStart },
    },
  });
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.vehicleCategory.findMany({ orderBy: { name: "asc" } });
  const addOns = await prisma.addOn.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        {/* <p>Kalender</p> */}
        <h1>Terminplan</h1>
      </header>

      <AdminCalendarClient
        blocks={blocks.map((block) => ({
          endTime: block.endTime.toISOString(),
          fullDay: block.fullDay,
          id: block.id,
          reason: block.reason,
          startTime: block.startTime.toISOString(),
        }))}
        bookings={bookings.map((booking) => ({
          addOns: booking.addOns.map((addOn) => addOn.name),
          clientEmail: booking.client.email,
          clientName: booking.client.name,
          clientPhone: booking.client.phone,
          endTime: booking.endTime.toISOString(),
          id: booking.id,
          serviceName: booking.service.name,
          startTime: booking.dateTime.toISOString(),
          status: booking.status,
          vehicle: `${booking.vehicleModel} - ${booking.vehicleCategory.name}`,
        }))}
        cancelBookingAction={cancelBooking}
        createBookingAction={createAdminBooking}
        createBlockAction={createAvailabilityBlock}
        deleteBlockAction={deleteAvailabilityBlock}
        addOns={addOns}
        categories={categories}
        services={services}
        updateBookingAction={updateBookingSchedule}
      />
    </div>
  );
}
