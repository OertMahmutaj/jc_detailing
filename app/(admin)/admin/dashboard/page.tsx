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

export default async function AdminDashboardPage() {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayCount, weekCount, monthBookings, pendingCount, clientCount, upcomingBookings] = await Promise.all([
    prisma.booking.count({
      where: {
        dateTime: { gte: today, lt: tomorrow },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.booking.count({
      where: {
        dateTime: { gte: weekStart },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.booking.findMany({
      where: {
        dateTime: { gte: monthStart },
        status: { not: "CANCELLED" },
      },
      include: {
        service: true,
        vehicleCategory: true,
      },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.client.count(),
    prisma.booking.findMany({
      where: {
        dateTime: { gte: now },
        status: { not: "CANCELLED" },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: { dateTime: "asc" },
      take: 6,
    }),
  ]);

  const monthRevenue = monthBookings.reduce((sum, booking) => {
    return sum + booking.service.basePrice + booking.vehicleCategory.priceModifier;
  }, 0);

  const statCards = [
    { label: "Heute", value: todayCount.toString(), hint: "aktive Termine" },
    { label: "Diese Woche", value: weekCount.toString(), hint: "Buchungen" },
    { label: "Dieser Monat", value: monthBookings.length.toString(), hint: "Buchungen" },
    { label: "Offen", value: pendingCount.toString(), hint: "Anfragen" },
    { label: "Kunden", value: clientCount.toString(), hint: "gespeichert" },
    { label: "Umsatz Monat", value: formatCurrency(monthRevenue), hint: "geschätzt" },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p>Übersicht</p>
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

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Nächste Termine</h2>
        </div>

        <div className="admin-list">
          {upcomingBookings.length ? (
            upcomingBookings.map((booking) => (
              <article className="admin-list-row" key={booking.id}>
                <div>
                  <strong>{booking.client.name}</strong>
                  <span>{booking.service.name}</span>
                </div>
                <time>{formatDate(booking.dateTime)}</time>
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
