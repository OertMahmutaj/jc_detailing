import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../_lib/prisma";
import { createAdminBooking } from "../../_actions/bookingActions";
import { AdminBookingCreator } from "../../_components/AdminBookingCreator";
import { AdminClientEditor } from "../../_components/AdminClientEditor";

function formatDate(value?: Date | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(value);
}

function getBookingServiceNames(booking: {
  service: {
    id: string;
    name: string;
  };
  services: {
    id: string;
    name: string;
  }[];
}) {
  const allServices = [booking.service, ...booking.services];

  return Array.from(
    new Map(allServices.map((service) => [service.id, service.name])).values()
  );
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const [client, services, vehicleCategories, addOns] = await Promise.all([
    prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        bookings: {
          orderBy: {
            dateTime: "desc",
          },
          include: {
            service: true,
            services: true,
            vehicleCategory: true,
            addOns: true,
            invoice: true,
          },
        },
      },
    }),
    prisma.service.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.vehicleCategory.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.addOn.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!client) {
    notFound();
  }

  const now = new Date();

  const lastAppointment =
    client.bookings.find(
      (booking) =>
        booking.status !== "CANCELLED" && booking.dateTime.getTime() <= now.getTime()
    ) ?? null;

  const totalSpend = client.bookings.reduce((total, booking) => {
    if (
      booking.status === "CANCELLED" ||
      booking.invoice?.status !== "PAID"
    ) {
      return total;
    }

    return total + booking.invoice.totalAmount;
  }, 0);

  const lastVehicle = lastAppointment
    ? `${lastAppointment.vehicleModel} · ${lastAppointment.vehicleCategory.name}`
    : "-";

  const lastService = lastAppointment
    ? getBookingServiceNames(lastAppointment).join(", ")
    : "-";

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <Link href="/admin/clients" className="admin-back-link">
            ← Zurück zu Kunden
          </Link>

          <h1>{client.name}</h1>
          <p>
            Kunde seit{" "}
            {new Intl.DateTimeFormat("de-CH", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(client.createdAt)}
          </p>
        </div>

        <AdminBookingCreator
          action={createAdminBooking}
          addOns={addOns}
          categories={vehicleCategories}
          client={{
            address: client.address,
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
          }}
          services={services}
        />
      </header>

      <section className="admin-client-summary">
        <article className="admin-client-summary-card">
          <span>Buchungen insgesamt</span>
          <strong>{client.bookings.length}</strong>
        </article>

        <article className="admin-client-summary-card">
          <span>Gesamtausgaben</span>
          <strong>{formatMoney(totalSpend)}</strong>
        </article>

        <article className="admin-client-summary-card">
          <span>Letzter Termin</span>
          <strong>{formatDate(lastAppointment?.dateTime)}</strong>
        </article>

        <article className="admin-client-summary-card">
          <span>Letztes Fahrzeug</span>
          <strong>{lastVehicle}</strong>
        </article>

        <article className="admin-client-summary-card">
          <span>Letzte Leistung</span>
          <strong>{lastService}</strong>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Kundendaten bearbeiten</h2>
        </div>

        <AdminClientEditor
          client={{
            address: client.address,
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
          }}
        />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Buchungen</h2>
            <p>{client.bookings.length} Buchungen insgesamt</p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table admin-client-bookings-table">
            <thead>
              <tr>
                <th>Termin</th>
                <th>Fahrzeug</th>
                <th>Leistung</th>
                <th>Status</th>
                <th>Rechnung</th>
                <th>Aktion</th>
              </tr>
            </thead>

            <tbody>
              {client.bookings.map((booking) => {
                const serviceNames = getBookingServiceNames(booking);

                return (
                  <tr key={booking.id}>
                    <td data-label="Termin">
                      <strong>{formatDate(booking.dateTime)}</strong>
                    </td>

                    <td data-label="Fahrzeug">
                      <strong>{booking.vehicleModel}</strong>
                      <span>{booking.vehicleCategory.name}</span>
                    </td>

                    <td data-label="Leistung">
                      <strong>{serviceNames.join(", ")}</strong>

                      {!!booking.addOns.length && (
                        <span>
                          Extras:{" "}
                          {booking.addOns.map((addOn) => addOn.name).join(", ")}
                        </span>
                      )}
                    </td>

                    <td data-label="Status">
                      <strong>{booking.status}</strong>
                    </td>

                    <td data-label="Rechnung">
                      {booking.invoice ? (
                        <>
                          <strong>{booking.invoice.invoiceNumber}</strong>
                          <span>
                            {formatMoney(booking.invoice.totalAmount)} ·{" "}
                            {booking.invoice.status}
                          </span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    <td data-label="Aktion">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="admin-table-action"
                      >
                        Buchung bearbeiten
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!client.bookings.length && (
            <p className="admin-empty">
              Dieser Kunde hat noch keine Buchungen.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
