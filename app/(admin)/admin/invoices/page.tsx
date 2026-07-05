import { prisma } from "../_lib/prisma";
import InvoicesDashboardClient from "./_components/InvoicesDashboardClient";

export default async function AdminInvoicesPage() {
  // Fetch bookings with their linked invoices and clients
  const bookings = await prisma.booking.findMany({
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
  });

  // Prefill baseline information if no invoice draft exists yet
  const formattedBookings = bookings.map((b) => ({
    bookingId: b.id,
    clientName: b.client.name,
    clientEmail: b.invoice?.emailOverride || b.client.email,
    serviceName: b.service.name,
    basePrice: b.service.basePrice,
    modifierPrice: b.vehicleCategory.priceModifier,
    dateTime: b.dateTime,
    invoice: b.invoice, 
  }));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p>Verwaltung</p>
        <h1>Rechnungen & Buchungen</h1>
      </header>

      <InvoicesDashboardClient bookings={formattedBookings} />
    </div>
  );
}