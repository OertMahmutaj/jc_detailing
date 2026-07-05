import Link from "next/link";
import { prisma } from "../_lib/prisma";
import InvoicesDashboardClient from "./_components/InvoicesDashboardClient";
import { AdminSearchForm } from "../_components/AdminSearchForm";
import { StandaloneInvoiceCreator } from "../_components/StandaloneInvoiceCreator";
import { createStandaloneInvoice } from "../_actions/invoiceActions";

const PAGE_SIZE = 5;

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (query) params.set("q", query);

  return `/admin/invoices?${params.toString()}`;
}

export default async function AdminInvoicesPage({
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
          { vehicleModel: { contains: query, mode: "insensitive" as const } },
          { service: { name: { contains: query, mode: "insensitive" as const } } },
          { invoice: { is: { invoiceNumber: { contains: query, mode: "insensitive" as const } } } },
        ],
      }
    : {};

  const [bookings, totalBookings, allInvoices, standaloneInvoices] = await Promise.all([
    prisma.booking.findMany({
      include: {
        client: true,
        service: true,
        vehicleCategory: true,
        invoice: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        dateTime: "desc",
      },
      skip,
      take: PAGE_SIZE,
      where,
    }),
    prisma.booking.count({ where }),
    prisma.invoice.findMany(),
    prisma.invoice.findMany({
      include: { items: true },
      orderBy: { issuedAt: "desc" },
      take: 5,
      where: {
        bookingId: null,
        ...(query
          ? {
              OR: [
                { invoiceNumber: { contains: query, mode: "insensitive" as const } },
                { emailOverride: { contains: query, mode: "insensitive" as const } },
                { recipientName: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const openRevenue = allInvoices
    .filter((invoice) => invoice.status === "SENT")
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const receivedThisMonth = allInvoices
    .filter((invoice) => invoice.status === "PAID" && invoice.paidAt && invoice.paidAt >= monthStart)
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const overduePayments = allInvoices
    .filter((invoice) => invoice.status !== "PAID" && invoice.dueDate < now)
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const formattedBookings = bookings.map((booking) => ({
    basePrice: booking.service.basePrice,
    bookingId: booking.id,
    clientEmail: booking.invoice?.emailOverride || booking.client.email,
    clientName: booking.client.name,
    dateTime: booking.dateTime,
    invoice: booking.invoice,
    modifierPrice: booking.vehicleCategory.priceModifier,
    serviceName: booking.service.name,
  }));

  const metrics = {
    openRevenue,
    overduePayments,
    receivedThisMonth,
  };
  const totalPages = Math.max(1, Math.ceil(totalBookings / PAGE_SIZE));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        {/* <p>Verwaltung</p> */}
        <h1>Rechnungen & Buchungen</h1>
        <StandaloneInvoiceCreator action={createStandaloneInvoice} />
      </header>

      <section className="admin-panel admin-search-panel">
        <div className="admin-panel-head">
          <h2>Rechnungen suchen</h2>
          <AdminSearchForm defaultValue={query} placeholder="Kunde, Rechnung, Service..." />
        </div>
      </section>

      <InvoicesDashboardClient bookings={formattedBookings} metrics={metrics} />

      <section className="admin-panel admin-standalone-invoices">
        <div className="admin-panel-head">
          <h2>Rechnungen ohne Buchung</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Rechnung</th>
                <th>Position</th>
                <th>Status</th>
                <th>Betrag</th>
              </tr>
            </thead>
            <tbody>
              {standaloneInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.recipientName || "-"}</strong>
                    <span>{invoice.emailOverride || "-"}</span>
                  </td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.items[0]?.description || "-"}</td>
                  <td>
                    <span className={`admin-status-pill is-${invoice.status.toLowerCase()}`}>
                      {invoice.status === "PAID" ? "Bezahlt" : "Gesendet"}
                    </span>
                  </td>
                  <td>CHF {invoice.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!standaloneInvoices.length && <p className="admin-empty">Keine freien Rechnungen vorhanden.</p>}
        </div>
      </section>

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
    </div>
  );
}
