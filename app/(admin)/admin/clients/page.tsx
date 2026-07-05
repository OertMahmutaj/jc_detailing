import { prisma } from "../_lib/prisma";

function formatDate(value?: Date) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
  }).format(value);
}

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      bookings: {
        include: {
          service: true,
        },
        orderBy: { dateTime: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p>Kunden</p>
        <h1>Clients</h1>
      </header>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kontakt</th>
                <th>Buchungen</th>
                <th>Letzter Termin</th>
                <th>Letzte Leistung</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const lastBooking = client.bookings[0];

                return (
                  <tr key={client.id}>
                    <td>
                      <strong>{client.name}</strong>
                      <span>Seit {formatDate(client.createdAt)}</span>
                    </td>
                    <td>
                      <strong>{client.email}</strong>
                      <span>{client.phone}</span>
                    </td>
                    <td>
                      <strong>{client.bookings.length}</strong>
                      <span>Termine</span>
                    </td>
                    <td>
                      <strong>{formatDate(lastBooking?.dateTime)}</strong>
                      <span>{lastBooking?.status ?? "-"}</span>
                    </td>
                    <td>
                      <strong>
                        {lastBooking ? lastBooking.service.name : "-"}
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!clients.length && <p className="admin-empty">Noch keine Kunden vorhanden.</p>}
        </div>
      </section>
    </div>
  );
}
