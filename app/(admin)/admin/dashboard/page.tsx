import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  Calendar,
  FileText,
  MessageCircle,
  Users,
  BarChart3,
} from "lucide-react";
import { prisma } from "../_lib/prisma";
import { getAdminBookingCatalog } from "../_lib/bookingCatalog";
import { AdminBookingCreator } from "../_components/AdminBookingCreator";
import { createAdminBooking } from "../_actions/bookingActions";

const DEFAULT_VAT_RATE = 0;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
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

function formatWeekday(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}

function toDateParam(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function bookingStatusClass(status: string) {
  const classes: Record<string, string> = {
    PENDING: "is-sent",
    CONFIRMED: "is-paid",
    COMPLETED: "is-paid",
    CANCELLED: "is-cancelled",
  };

  return classes[status] ?? "is-open";
}

function toGrossAmount(netAmount: number, vatRate = DEFAULT_VAT_RATE) {
  return Math.round(netAmount * (1 + vatRate / 100) * 100) / 100;
}

function formatGrossCurrency(netAmount: number, vatRate = DEFAULT_VAT_RATE) {
  return formatCurrency(toGrossAmount(netAmount, vatRate));
}

type DashboardService = {
  id: string;
  basePrice: number;
  vehicleOptions?: { priceModifier: number; vehicleCategoryId: string }[];
};

type DashboardAddOn = {
  price: number;
  serviceOptions?: { price: number; serviceId: string }[];
};

function dashboardBookingServices(booking: {
  service: DashboardService;
  services?: DashboardService[];
}) {
  return booking.services?.length ? booking.services : [booking.service];
}

function dashboardVehiclePrice(
  service: DashboardService,
  vehicleCategoryId: string,
) {
  return (
    service.vehicleOptions?.find(
      (option) => option.vehicleCategoryId === vehicleCategoryId,
    )?.priceModifier ?? 0
  );
}

function dashboardAddOnPrice(addOn: DashboardAddOn, serviceIds: string[]) {
  for (const serviceId of serviceIds) {
    const option = addOn.serviceOptions?.find(
      (serviceOption) => serviceOption.serviceId === serviceId,
    );

    if (option) return option.price;
  }

  return addOn.price;
}

function bookingNetAmount(booking: {
  service: DashboardService;
  services?: DashboardService[];
  vehicleCategoryId: string;
  addOns: DashboardAddOn[];
}) {
  const services = dashboardBookingServices(booking);
  const serviceIds = services.map((service) => service.id);
  const addOnsTotal = booking.addOns.reduce(
    (sum, addOn) => sum + dashboardAddOnPrice(addOn, serviceIds),
    0
  );

  return (
    services.reduce((sum, service) => sum + service.basePrice, 0) +
    services.reduce(
      (sum, service) =>
        sum + dashboardVehiclePrice(service, booking.vehicleCategoryId),
      0,
    ) +
    addOnsTotal
  );
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const sixDaysEnd = addDays(today, 6);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const dashboardQueryStartedAt = performance.now();

  const [
    todayBookings,
    weekCount,
    monthBookings,
    pendingCount,
    clientCount,
    upcomingBookings,
    openInvoices,
    overdueInvoices,
    nextSevenDaysBookings,
    catalog,
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
        invoice: true,
        service: true,
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
        vehicleCategory: true,
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

    prisma.booking.findMany({
      where: {
        dateTime: {
          gte: today,
          lt: sixDaysEnd,
        },
        status: {
          not: "CANCELLED",
        },
      },
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
    }),

    getAdminBookingCatalog(),
  ]);
  const { addOns, categories, services } = catalog;

  console.log(
    `[admin-dashboard] queries: ${Math.round(
      performance.now() - dashboardQueryStartedAt,
    )}ms`,
  );

  // const services = await prisma.service.findMany({
  //   orderBy: {
  //     name: "asc",
  //   },
  // });

  // const categories = await prisma.vehicleCategory.findMany({
  //   orderBy: {
  //     name: "asc",
  //   },
  // });

  // const addOns = await prisma.addOn.findMany({
  //   orderBy: {
  //     name: "asc",
  //   },
  // });

  const monthRevenue = monthBookings.reduce(
    (sum, booking) => sum + bookingNetAmount(booking),
    0
  );

  const openInvoiceTotal = openInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  const overdueInvoiceTotal = overdueInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  const weekDays = Array.from({ length: 6 }, (_, index) => {
    const date = addDays(today, index);

    const bookings = nextSevenDaysBookings.filter((booking) => {
      const bookingDay = startOfDay(booking.dateTime);
      return bookingDay.getTime() === date.getTime();
    });

    const plannedNetRevenue = bookings.reduce(
      (sum, booking) => sum + bookingNetAmount(booking),
      0
    );

    return {
      bookingsCount: bookings.length,
      date,
      plannedNetRevenue,
    };
  });

  const statCards = [
    {
      hint: "aktive Termine",
      label: "Heute",
      value: todayBookings.length.toString(),
      icon: CalendarDays,
      accent: "#ff7a26",
    },
    {
      hint: "Buchungen",
      label: "Diese Woche",
      value: weekCount.toString(),
      icon: CalendarPlus,
      accent: "#0077ff",
    },
    {
      hint: "Buchungen",
      label: "Dieser Monat",
      value: monthBookings.length.toString(),
      icon: Calendar,
      accent: "#28c76f",
    },
    {
      hint: "Anfragen",
      label: "Offen",
      value: pendingCount.toString(),
      icon: MessageCircle,
      accent: "#ffb400",
    },
    {
      hint: "gespeichert",
      label: "Kunden",
      value: clientCount.toString(),
      icon: Users,
      accent: "#9c6cff",
    },
    {
      hint: "inkl. MwSt.",
      label: "Umsatz Monat",
      value: formatGrossCurrency(monthRevenue),
      icon: BarChart3,
      accent: "#00bfa5",
    },
  ];

  return (
    <div className="admin-page admin-dashboard-page">
      <header className="admin-page-header admin-dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <div className="admin-dashboard-tabs" aria-label="Dashboard Zeitraum">
            <span>Übersicht</span>
            <button type="button">Monat</button>
          </div>
        </div>

        <div className="admin-dashboard-header-actions">
          <AdminBookingCreator
            action={createAdminBooking}
            addOns={addOns}
            categories={categories}
            services={services}
          />

        </div>
      </header>

      <section className="admin-dashboard-overview">
        <div className="admin-dashboard-overview-section admin-dashboard-month-section">
          <div className="admin-stat-grid admin-month-stat-grid">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <article className="admin-stat-card" key={stat.label}>
                  <div className="admin-stat-card-heading">
                    <div
                      className="admin-stat-card-icon"
                      style={{ backgroundColor: `${stat.accent}18`, color: stat.accent }}
                    >
                      <Icon size={18} />
                    </div>
                    <span>{stat.label}</span>
                  </div>
                  <strong>{stat.value}</strong>
                  <small>{stat.hint}</small>
                </article>
              );
            })}
          </div>
        </div>

        <div className="admin-dashboard-overview-section admin-dashboard-planning-section">
          <div className="admin-dashboard-section-title">
            <span>Planung</span>
            <h2>Nächste 6 Tage</h2>
          </div>

          <div className="admin-week-grid">
            {weekDays.map((day) => (
              <Link
                className="admin-stat-card admin-week-card"
                href={`/admin/calendar?date=${toDateParam(day.date)}`}
                key={toDateParam(day.date)}
              >
                <span>{formatWeekday(day.date)}</span>

                <strong>{day.bookingsCount}</strong>

                <small>
                  {day.bookingsCount === 1
                    ? "1 Termin"
                    : `${day.bookingsCount} Termine`}
                  {" · "}
                  {day.bookingsCount
                    ? `${formatGrossCurrency(day.plannedNetRevenue)} geplant`
                    : "Frei"}
                </small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-dashboard-today-panel">
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
                <article
                  className="admin-dashboard-booking-row"
                  key={booking.id}
                >
                  <div className="admin-dashboard-time">
                    <strong>
                      {formatTime(booking.dateTime)}–
                      {formatTime(booking.endTime)}
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
                    <span>
                      {booking.invoice
                        ? formatGrossCurrency(
                          booking.invoice.totalAmount,
                          booking.invoice.vatRate
                        )
                        : "—"}
                    </span>
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
              <div className="admin-dashboard-empty-state">
                <CalendarDays size={34} />
                <p>Für heute sind keine aktiven Termine geplant.</p>
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel admin-dashboard-invoices-panel">
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
            <div className="admin-invoice-summary-card is-open">
              <div>
                <span>Offen</span>
                <strong>{formatGrossCurrency(openInvoiceTotal)}</strong>
                <small>{openInvoices.length} Rechnungen</small>
              </div>
              <FileText aria-hidden="true" size={24} />
            </div>

            <div className="admin-invoice-summary-card admin-invoice-summary--overdue">
              <div>
                <span>Überfällig</span>
                <strong>{formatGrossCurrency(overdueInvoiceTotal)}</strong>
                <small>{overdueInvoices.length} Rechnungen</small>
              </div>
              <AlertTriangle aria-hidden="true" size={24} />
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
                    {formatGrossCurrency(
                      invoice.totalAmount,
                      invoice.vatRate
                    )}
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

      <section className="admin-panel admin-dashboard-upcoming-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Nächste Termine</h2>
            <span>Die nächsten sechs aktiven Buchungen</span>
          </div>

          <Link className="admin-table-action" href="/admin/bookings">
            Alle Buchungen
          </Link>
        </div>

        <div className="admin-dashboard-table-wrap">
          {upcomingBookings.length ? (
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Kunde</th>
                  <th>Service</th>
                  <th>Fahrzeug</th>
                  <th>Datum & Zeit</th>
                  <th>Status</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td data-label="Kunde">
                      <strong>{booking.client.name}</strong>
                      <span>{booking.client.email}</span>
                    </td>
                    <td data-label="Service">
                      <strong>
                        {booking.service.name}
                        <i aria-hidden="true" />
                      </strong>
                      <span>{bookingStatusLabel(booking.status)}</span>
                    </td>
                    <td data-label="Fahrzeug">
                      <strong>{booking.vehicleModel}</strong>
                      <span>{booking.vehicleCategory.name}</span>
                    </td>
                    <td data-label="Datum & Zeit">
                      <strong>{formatDate(booking.dateTime)}</strong>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`admin-status-pill ${bookingStatusClass(
                          booking.status
                        )}`}
                      >
                        {bookingStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td data-label="Aktion">
                      <Link
                        className="admin-dashboard-open-link"
                        href={`/admin/bookings/${booking.id}`}
                      >
                        Öffnen
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-empty">Keine kommenden Termine.</p>
          )}
        </div>
      </section>

      <footer className="admin-dashboard-footer">
        <span>JC Detailing</span>
        <span>Luzern, Switzerland</span>
        <span>© 2026 JC Detailing. Alle Rechte vorbehalten.</span>
      </footer>
    </div>
  );
}
