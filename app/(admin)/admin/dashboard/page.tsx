import Link from "next/link";
import { prisma } from "../_lib/prisma";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-CH", {
    currency: "CHF",
    style: "currency",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatDateOnly(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function bookingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Offen",
    CONFIRMED: "Bestätigt",
    COMPLETED: "Abgeschlossen",
    CANCELLED: "Storniert",
  };

  return labels[status] ?? status;
}

function invoiceStatusLabel(status?: string | null) {
  if (!status) return "Keine Rechnung";

  const labels: Record<string, string> = {
    SENT: "Offen",
    PAID: "Bezahlt",
  };

  return labels[status] ?? status;
}

const DEFAULT_VAT_RATE = 8.1;

function toGrossAmount(netAmount: number, vatRate = DEFAULT_VAT_RATE) {
  return Math.round(netAmount * (1 + vatRate / 100) * 100) / 100;
}

function formatGrossCurrency(netAmount: number, vatRate = DEFAULT_VAT_RATE) {
  return formatCurrency(toGrossAmount(netAmount, vatRate));
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const today = startOfDay(now);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayBookings,
    weekCount,
    monthBookings,
    pendingCount,
    clientCount,
    upcomingBookings,
    openInvoices,
    overdueInvoices,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: {
        dateTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        client: true,
        service: true,
        invoice: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    }),

    prisma.booking.count({
      where: {
        dateTime: {
          gte: weekStart,
        },
        status: {
          not: "CANCELLED",
        },
      },
    }),

    prisma.booking.findMany({
      where: {
        dateTime: {
          gte: monthStart,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        service: true,
        vehicleCategory: true,
        addOns: true,
      },
    }),

    prisma.booking.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.client.count(),

    prisma.booking.findMany({
      where: {
        dateTime: {
          gte: now,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: {
        dateTime: "asc",
      },
      take: 6,
    }),

    prisma.invoice.findMany({
      where: {
        status: "SENT",
        dueDate: {
          gte: now,
        },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
    }),

    prisma.invoice.findMany({
      where: {
        status: "SENT",
        dueDate: {
          lt: now,
        },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
    }),
  ]);

  const monthRevenue = monthBookings.reduce((sum, booking) => {
    const addOnsTotal = booking.addOns.reduce((addOnSum, addOn) => {
      return addOnSum + addOn.price;
    }, 0);

    return (
      sum +
      booking.service.basePrice +
      booking.vehicleCategory.priceModifier +
      addOnsTotal
    );
  }, 0);

  const openInvoiceTotal = openInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  const overdueInvoiceTotal = overdueInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  const statCards = [
    {
      label: "Heute",
      value: todayBookings.length.toString(),
      hint: "aktive Termine",
    },
    {
      label: "Diese Woche",
      value: weekCount.toString(),
      hint: "Buchungen",
    },
    {
      label: "Dieser Monat",
      value: monthBookings.length.toString(),
      hint: "Buchungen",
    },
    {
      label: "Offen",
      value: pendingCount.toString(),
      hint: "Anfragen",
    },
    {
      label: "Kunden",
      value: clientCount.toString(),
      hint: "gespeichert",
    },
    {
      label: "Umsatz Monat",
      value: formatGrossCurrency(monthRevenue),
      hint: "inkl. MwSt.",
    },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Dashboard</h1>
      </header>

      <section className="admin-stat-grid">
        {statCards.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.hint}</small>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Heute anstehend</h2>
              <span>
                {todayBookings.length
                  ? `${todayBookings.length} Termine heute`
                  : "Keine Termine heute"}
              </span>
            </div>

            <Link className="admin-table-action" href="/admin/calendar">
              Kalender öffnen
            </Link>
          </div>

          <div className="admin-list">
            {todayBookings.length ? (
              todayBookings.map((booking) => (
                <article className="admin-dashboard-booking-row" key={booking.id}>
                  <div className="admin-dashboard-time">
                    <strong>
                      {formatTime(booking.dateTime)}–{formatTime(booking.endTime)}
                    </strong>
                    <span>{bookingStatusLabel(booking.status)}</span>
                  </div>

                  <div className="admin-dashboard-booking-info">
                    <strong>{booking.client.name}</strong>
                    <span>
                      {booking.vehicleModel} · {booking.service.name}
                    </span>
                  </div>

                  <div className="admin-dashboard-invoice">
                    <strong>{invoiceStatusLabel(booking.invoice?.status)}</strong>

                    {booking.invoice ? (
                      <span>
                        {formatGrossCurrency(
                          booking.invoice.totalAmount,
                          booking.invoice.vatRate
                        )}
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </div>

                  <Link
                    className="admin-table-action"
                    href={`/admin/bookings/${booking.id}`}
                  >
                    Öffnen
                  </Link>
                </article>
              ))
            ) : (
              <p className="admin-empty">
                Für heute sind keine aktiven Termine geplant.
              </p>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Rechnungen</h2>
              <span>Offene Zahlungen im Blick behalten</span>
            </div>

            <Link className="admin-table-action" href="/admin/invoices">
              Alle Rechnungen
            </Link>
          </div>

          <div className="admin-invoice-summary">
            <div>
              <span>Offen</span>
              <strong>{formatGrossCurrency(openInvoiceTotal)}</strong>
              <small>{openInvoices.length} Rechnungen</small>
            </div>

            <div className="admin-invoice-summary--overdue">
              <span>Überfällig</span>
              <strong>{formatGrossCurrency(overdueInvoiceTotal)}</strong>
              <small>{overdueInvoices.length} Rechnungen</small>
            </div>
          </div>

          <div className="admin-list">
            {overdueInvoices.length ? (
              overdueInvoices.map((invoice) => (
                <article className="admin-list-row" key={invoice.id}>
                  <div>
                    <strong>
                      {invoice.booking?.client.name ?? "Unbekannter Kunde"}
                    </strong>
                    <span>
                      {invoice.invoiceNumber} · fällig seit{" "}
                      {formatDateOnly(invoice.dueDate)}
                    </span>
                  </div>

                  <strong>
                    {formatGrossCurrency(invoice.totalAmount, invoice.vatRate)}
                  </strong>
                </article>
              ))
            ) : (
              <p className="admin-empty">
                Keine überfälligen Rechnungen.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Nächste Termine</h2>
            <span>Die nächsten sechs aktiven Buchungen</span>
          </div>

          <Link className="admin-table-action" href="/admin/bookings">
            Alle Buchungen
          </Link>
        </div>

        <div className="admin-list">
          {upcomingBookings.length ? (
            upcomingBookings.map((booking) => (
              <article className="admin-list-row" key={booking.id}>
                <div>
                  <strong>{booking.client.name}</strong>
                  <span>
                    {booking.vehicleModel} · {booking.service.name} ·{" "}
                    {bookingStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="admin-list-row-actions">
                  <time>{formatDate(booking.dateTime)}</time>

                  <Link
                    className="admin-table-action"
                    href={`/admin/bookings/${booking.id}`}
                  >
                    Öffnen
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <p className="admin-empty">Keine kommenden Termine.</p>
          )}
        </div>
      </section>
    </div>
  );
}