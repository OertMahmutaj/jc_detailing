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

  const startTime = fullDay
    ? buildDateTime(date, "00:00")
    : buildDateTime(date, start);

  const endTime = fullDay
    ? buildDateTime(date, "23:59")
    : buildDateTime(date, end);

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

  await prisma.availabilityBlock.delete({
    where: { id },
  });

  revalidatePath("/admin/calendar");
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const requestedDate = String(params.date ?? "");

  const isValidRequestedDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate);

  const initialDate = isValidRequestedDate ? requestedDate : undefined;

  const now = new Date();

  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 13,
    0,
    23,
    59,
    59,
  );

  const bookings = await prisma.booking.findMany({
    include: {
      addOns: true,
      client: true,
      service: true,
      services: true,
      vehicleCategory: true,
    },
    orderBy: {
      dateTime: "asc",
    },
    where: {
      dateTime: {
        gte: rangeStart,
        lte: rangeEnd,
      },
      status: {
        not: "CANCELLED",
      },
    },
  });

  const blocks = await prisma.availabilityBlock.findMany({
    orderBy: {
      startTime: "asc",
    },
    where: {
      startTime: {
        lte: rangeEnd,
      },
      endTime: {
        gte: rangeStart,
      },
    },
  });

  const services = await prisma.service.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const categories = await prisma.vehicleCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const addOns = await prisma.addOn.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Terminplan</h1>
      </header>

      <AdminCalendarClient
        initialDate={initialDate}
        blocks={blocks.map((block) => ({
          endTime: block.endTime.toISOString(),
          fullDay: block.fullDay,
          id: block.id,
          reason: block.reason,
          startTime: block.startTime.toISOString(),
        }))}
        bookings={bookings.map((booking) => {
          const selectedServices = booking.services.length
            ? booking.services
            : [booking.service];

          const totalAmount =
            selectedServices.reduce(
              (sum, service) => sum + service.basePrice,
              0,
            ) +
            booking.vehicleCategory.priceModifier +
            booking.addOns.reduce((sum, addOn) => sum + addOn.price, 0);

          return {
            addOns: booking.addOns.map((addOn) => addOn.name),
            clientEmail: booking.client.email,
            clientName: booking.client.name,
            clientPhone: booking.client.phone,
            endTime: booking.endTime.toISOString(),
            id: booking.id,
            serviceName: selectedServices
              .map((service) => service.name)
              .join(", "),
            startTime: booking.dateTime.toISOString(),
            status: booking.status,
            totalAmount,
            vehicle: `${booking.vehicleModel} - ${booking.vehicleCategory.name}`,
          };
        })}
        createBookingAction={createAdminBooking}
        createBlockAction={createAvailabilityBlock}
        deleteBlockAction={deleteAvailabilityBlock}
        addOns={addOns}
        categories={categories}
        services={services}
      />
    </div>
  );
}