import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";
import { getAdminBookingCatalog } from "../_lib/bookingCatalog";
import { AdminCalendarClient } from "./AdminCalendarClient";
import { createAdminBooking } from "../_actions/bookingActions";

function buildDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function serviceVehiclePrice(
  service: {
    vehicleOptions?: { priceModifier: number; vehicleCategoryId: string }[];
  },
  vehicleCategoryId: string,
) {
  return (
    service.vehicleOptions?.find(
      (option) => option.vehicleCategoryId === vehicleCategoryId,
    )?.priceModifier ?? 0
  );
}

function addOnPriceForServices(
  addOn: {
    price: number;
    serviceOptions?: { price: number; serviceId: string }[];
  },
  serviceIds: string[],
) {
  for (const serviceId of serviceIds) {
    const option = addOn.serviceOptions?.find(
      (serviceOption) => serviceOption.serviceId === serviceId,
    );

    if (option) return option.price;
  }

  return addOn.price;
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
      addOns: {
        include: {
          serviceOptions: {
            select: {
              price: true,
              serviceId: true,
            },
            where: {
              isActive: true,
            },
          },
        },
      },
      client: true,
      service: {
        include: {
          vehicleOptions: {
            select: {
              priceModifier: true,
              vehicleCategoryId: true,
            },
            where: {
              isActive: true,
            },
          },
        },
      },
      services: {
        include: {
          vehicleOptions: {
            select: {
              priceModifier: true,
              vehicleCategoryId: true,
            },
            where: {
              isActive: true,
            },
          },
        },
      },
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

  const { addOns, categories, services } = await getAdminBookingCatalog();

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
          const selectedServiceIds = selectedServices.map(
            (service) => service.id,
          );

          const totalAmount =
            selectedServices.reduce(
              (sum, service) => sum + service.basePrice,
              0,
            ) +
            selectedServices.reduce(
              (sum, service) =>
                sum +
                serviceVehiclePrice(service, booking.vehicleCategoryId),
              0,
            ) +
            booking.addOns.reduce(
              (sum, addOn) =>
                sum + addOnPriceForServices(addOn, selectedServiceIds),
              0,
            );

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
