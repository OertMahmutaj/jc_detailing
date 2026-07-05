import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";
import { AdminSearchForm } from "../_components/AdminSearchForm";
import { AdminBookingCreator } from "../_components/AdminBookingCreator";
import { createAdminBooking } from "../_actions/bookingActions";

const PAGE_SIZE = 5;

const statusLabels = {
  PENDING: "Offen",
  CONFIRMED: "Bestaetigt",
  COMPLETED: "Erledigt",
  CANCELLED: "Storniert",
} as const;

async function updateBookingStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !Object.keys(statusLabels).includes(status)) return;

  await prisma.booking.update({
    where: { id },
    data: { status: status as keyof typeof statusLabels },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
}

async function updateBookingSchedule(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!id || !date || !time) return;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { dateTime: true, endTime: true },
  });

  if (!booking) return;

  const durationMs = booking.endTime.getTime() - booking.dateTime.getTime();
  const dateTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(dateTime.getTime() + durationMs);

  await prisma.booking.update({
    where: { id },
    data: { dateTime, endTime },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
}

async function deleteBooking(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.booking.delete({ where: { id } });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
}

function formatDate(value: Date) {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

function inputDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

// In your AdminBookingsPage.tsx
function inputTime(value: Date) {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`; // This will always return 'HH:mm'
}

function formatDuration(start: Date, end: Date) {
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!hours) return `${rest} Min.`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest} Min.`;
}

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (query) params.set("q", query);

  return `/admin/bookings?${params.toString()}`;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const query = String(params.q ?? "").trim();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const where = query
    ? {
        OR: [
          { client: { name: { contains: query, mode: "insensitive" as const } } },
          { client: { email: { contains: query, mode: "insensitive" as const } } },
          { client: { phone: { contains: query, mode: "insensitive" as const } } },
          { vehicleModel: { contains: query, mode: "insensitive" as const } },
          { service: { name: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [bookings, totalBookings, services, categories, addOns] = await Promise.all([
    prisma.booking.findMany({
      include: {
        addOns: true,
        client: true,
        invoice: true,
        service: true,
        vehicleCategory: true,
      },
      orderBy: { dateTime: "desc" },
      skip,
      take: PAGE_SIZE,
      where,
    }),
    prisma.booking.count({ where }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicleCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.addOn.findMany({ orderBy: { name: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalBookings / PAGE_SIZE));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        {/* <p>Termine</p> */}
        <h1>Buchungen</h1>
        <AdminBookingCreator action={createAdminBooking} addOns={addOns} categories={categories} services={services} />
      </header>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Alle Buchungen</h2>
          <AdminSearchForm defaultValue={query} placeholder="Kunde, E-Mail, Fahrzeug..." />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Termin</th>
                <th>Leistungen</th>
                <th>Fahrzeug</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.client.name}</strong>
                    <span>{booking.client.email}</span>
                    <span>{booking.client.phone}</span>
                  </td>
                  <td>
                    <strong>{formatDate(booking.dateTime)}</strong>
                    <span>{formatDuration(booking.dateTime, booking.endTime)}</span>
                    <form action={updateBookingSchedule} className="admin-inline-form">
                      <input name="id" type="hidden" value={booking.id} />
                      <input name="date" type="date" defaultValue={inputDate(booking.dateTime)} />
                      <input name="time" type="time" min="08:00" max="19:30" step="1800" defaultValue={inputTime(booking.dateTime)} />
                      <button className="admin-mini-button" type="submit">
                        Aendern
                      </button>
                    </form>
                  </td>
                  <td>
                    <strong>{booking.service.name}</strong>
                    <span>{booking.addOns.map((addOn) => addOn.name).join(", ") || "Keine Extras"}</span>
                  </td>
                  <td>
                    <strong>{booking.vehicleModel}</strong>
                    <span>{booking.vehicleCategory.name}</span>
                  </td>
                  <td>
                    <form action={updateBookingStatus}>
                      <input name="id" type="hidden" value={booking.id} />
                      <select className="admin-select" defaultValue={booking.status} name="status">
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button className="admin-mini-button" type="submit">
                        Speichern
                      </button>
                    </form>
                  </td>
                  <td>
                    <form action={deleteBooking}>
                      <input name="id" type="hidden" value={booking.id} />
                      <button className="admin-danger-button" type="submit">
                        Loeschen
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!bookings.length && <p className="admin-empty">Keine Buchungen gefunden.</p>}
        </div>

        <div className="admin-pagination">
          <Link aria-disabled={page <= 1} href={pageHref(Math.max(1, page - 1), query)}>
            Zurueck
          </Link>
          <span>
            Seite {page} von {totalPages}
          </span>
          <Link aria-disabled={page >= totalPages} href={pageHref(Math.min(totalPages, page + 1), query)}>
            Weiter
          </Link>
        </div>
      </section>
    </div>
  );
}
