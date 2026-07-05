import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";

const statusLabels = {
  PENDING: "Offen",
  CONFIRMED: "Bestätigt",
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

async function deleteBooking(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.booking.delete({ where: { id } });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatDuration(start: Date, end: Date) {
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!hours) return `${rest} Min.`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest} Min.`;
}

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      addOns: true,
      client: true,
      invoice: true,
      service: true,
      vehicleCategory: true,
    },
    orderBy: { dateTime: "desc" },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p>Termine</p>
        <h1>Buchungen</h1>
      </header>

      <section className="admin-panel">
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
                        Löschen
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!bookings.length && <p className="admin-empty">Noch keine Buchungen vorhanden.</p>}
        </div>
      </section>
    </div>
  );
}
