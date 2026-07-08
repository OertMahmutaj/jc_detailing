import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "../_lib/prisma";
import InvoicesDashboardClient from "./_components/InvoicesDashboardClient";
import { InvoiceFilters } from "./_components/InvoiceFilters";

const PAGE_SIZE = 5;

type InvoiceStatusFilter = "all" | "missing" | "sent" | "paid" | "overdue";

type InvoiceSort =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc";

function cleanStatus(value: unknown): InvoiceStatusFilter {
  return value === "missing" ||
    value === "sent" ||
    value === "paid" ||
    value === "overdue"
    ? value
    : "all";
}

function cleanSort(value: unknown): InvoiceSort {
  return value === "date-asc" ||
    value === "amount-desc" ||
    value === "amount-asc"
    ? value
    : "date-desc";
}

function pageHref({
  page,
  query,
  sort,
  status,
}: {
  page: number;
  query: string;
  sort: InvoiceSort;
  status: InvoiceStatusFilter;
}) {
  const params = new URLSearchParams();

  params.set("page", String(page));

  if (query) params.set("q", query);
  if (status !== "all") params.set("status", status);
  if (sort !== "date-desc") params.set("sort", sort);

  return `/admin/invoices?${params.toString()}`;
}

function bookingAmount(booking: {
  invoice: { totalAmount: number } | null;
  service: { basePrice: number };
  vehicleCategory: { priceModifier: number };
}) {
  return (
    booking.invoice?.totalAmount ??
    booking.service.basePrice + booking.vehicleCategory.priceModifier
  );
}

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    sort?: string;
    status?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const query = String(params.q ?? "").trim();
  const status = cleanStatus(params.status);
  const sort = cleanSort(params.sort);
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const now = new Date();

  const whereParts: Prisma.BookingWhereInput[] = [];

  if (query) {
    whereParts.push({
      OR: [
        {
          client: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          client: {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          vehicleModel: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          service: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          invoice: {
            is: {
              invoiceNumber: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  if (status === "missing") {
    whereParts.push({
      invoice: {
        is: null,
      },
    });
  }

  if (status === "sent") {
    whereParts.push({
      invoice: {
        is: {
          status: "SENT",
        },
      },
    });
  }

  if (status === "paid") {
    whereParts.push({
      invoice: {
        is: {
          status: "PAID",
        },
      },
    });
  }

  if (status === "overdue") {
    whereParts.push({
      invoice: {
        is: {
          status: "SENT",
          dueDate: {
            lt: now,
          },
        },
      },
    });
  }

  const where: Prisma.BookingWhereInput = whereParts.length
    ? {
        AND: whereParts,
      }
    : {};

  const [allBookings, allInvoices] = await Promise.all([
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
      where,
    }),
    prisma.invoice.findMany(),
  ]);

  const sortedBookings = [...allBookings].sort((a, b) => {
    if (sort === "date-asc") {
      return a.dateTime.getTime() - b.dateTime.getTime();
    }

    if (sort === "amount-desc") {
      return bookingAmount(b) - bookingAmount(a);
    }

    if (sort === "amount-asc") {
      return bookingAmount(a) - bookingAmount(b);
    }

    return b.dateTime.getTime() - a.dateTime.getTime();
  });

  const bookings = sortedBookings.slice(skip, skip + PAGE_SIZE);
  const totalBookings = sortedBookings.length;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const openRevenue = allInvoices
    .filter((invoice) => invoice.status === "SENT")
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const receivedThisMonth = allInvoices
    .filter(
      (invoice) =>
        invoice.status === "PAID" &&
        invoice.paidAt &&
        invoice.paidAt >= monthStart,
    )
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
    totalAmount: bookingAmount(booking),
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
        <h1>Rechnungen & Buchungen</h1>
      </header>

      <section className="admin-panel admin-search-panel">
        <div className="admin-panel-head">
          <h2>Rechnungen suchen</h2>

          <InvoiceFilters query={query} status={status} sort={sort} />
        </div>
      </section>

      <InvoicesDashboardClient bookings={formattedBookings} metrics={metrics} />

      <div className="admin-pagination">
        <Link
          aria-disabled={page <= 1}
          href={pageHref({
            page: Math.max(1, page - 1),
            query,
            sort,
            status,
          })}
        >
          Zurück
        </Link>

        <span>
          Seite {page} von {totalPages}
        </span>

        <Link
          aria-disabled={page >= totalPages}
          href={pageHref({
            page: Math.min(totalPages, page + 1),
            query,
            sort,
            status,
          })}
        >
          Weiter
        </Link>
      </div>
    </div>
  );
}