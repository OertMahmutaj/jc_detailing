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

async function updateBookingSchedule(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");

  if (!id || !date || !start || !end) return;

  const dateTime = buildDateTime(date, start);
  const endTime = buildDateTime(date, end);

  if (endTime <= dateTime) return;

  await prisma.booking.update({
    where: { id },
    data: { dateTime, endTime },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
}

async function cancelBooking(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.booking.delete({ where: { id } });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/dashboard");
}

export default async function AdminCalendarPage() {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 13, 0, 23, 59, 59);

  const [bookings, blocks, services, categories, addOns] = await Promise.all([
    prisma.booking.findMany({
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
    }),
    prisma.availabilityBlock.findMany({
      orderBy: { startTime: "asc" },
      where: {
        startTime: { lte: rangeEnd },
        endTime: { gte: rangeStart },
      },
    }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicleCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.addOn.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p>Kalender</p>
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
