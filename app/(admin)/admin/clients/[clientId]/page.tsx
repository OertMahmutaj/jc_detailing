import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../_lib/prisma";
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

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const client = await prisma.client.findUnique({
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
  });

  if (!client) {
    notFound();
  }

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
      </header>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Kundendaten bearbeiten</h2>
        </div>

        <AdminClientEditor
          client={{
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
          <table className="admin-table">
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
                const services = [
                  booking.service.name,
                  ...booking.services.map((service) => service.name),
                ];

                return (
                  <tr key={booking.id}>
                    <td>
                      <strong>{formatDate(booking.dateTime)}</strong>
                    </td>

                    <td>
                      <strong>{booking.vehicleModel}</strong>
                      <span>{booking.vehicleCategory.name}</span>
                    </td>

                    <td>
                      <strong>{services.join(", ")}</strong>

                      {!!booking.addOns.length && (
                        <span>
                          Extras:{" "}
                          {booking.addOns.map((addOn) => addOn.name).join(", ")}
                        </span>
                      )}
                    </td>

                    <td>
                      <strong>{booking.status}</strong>
                    </td>

                    <td>
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

                    <td>
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