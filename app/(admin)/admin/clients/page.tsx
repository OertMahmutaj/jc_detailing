import Link from "next/link";
import { prisma } from "../_lib/prisma";
import { AdminSearchForm } from "../_components/AdminSearchForm";

const PAGE_SIZE = 5;

function formatDate(value?: Date) {
  if (!value) return "-";

  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();

  return `${day}.${month}.${year}`;
}

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (query) params.set("q", query);

  return `/admin/clients?${params.toString()}`;
}

export default async function AdminClientsPage({
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
        { name: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
        { phone: { contains: query, mode: "insensitive" as const } },
        { bookings: { some: { vehicleModel: { contains: query, mode: "insensitive" as const } } } },
        { bookings: { some: { service: { name: { contains: query, mode: "insensitive" as const } } } } },
      ],
    }
    : {};

  const [clients, totalClients] = await Promise.all([
    prisma.client.findMany({
      include: {
        bookings: {
          include: {
            service: true,
          },
          orderBy: { dateTime: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      where,
    }),
    prisma.client.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalClients / PAGE_SIZE));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        {/* <p>Kunden</p> */}
        <h1>Clients</h1>
      </header>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Alle Kunden</h2>
          <AdminSearchForm defaultValue={query} placeholder="Name, E-Mail, Telefon..." />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kontakt</th>
                <th>Buchungen</th>
                <th>Letzter Termin</th>
                <th>Letzte Leistung</th>
                <th>Aktion</th>
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
                      <strong>{lastBooking ? lastBooking.service.name : "-"}</strong>
                    </td>
                    <td>
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="admin-table-action"
                      >
                        Bearbeiten
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!clients.length && <p className="admin-empty">Keine Kunden gefunden.</p>}
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
