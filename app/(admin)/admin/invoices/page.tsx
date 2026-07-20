import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "../_lib/prisma";
import InvoicesDashboardClient from "./_components/InvoicesDashboardClient";
import { InvoiceFilters } from "./_components/InvoiceFilters";
import {
  invoiceVehicleCategoryDescription,
  normalizeInvoiceLanguage,
  translateInvoiceItemDescription,
} from "@/app/lib/invoiceItemTranslations";

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

type LinkedVehicleOption = {
  priceModifier: number;
  vehicleCategoryId: string;
};

type LinkedService = {
  basePrice: number;
  id: string;
  name: string;
  vehicleOptions?: LinkedVehicleOption[];
};

type LinkedAddOn = {
  price: number;
  serviceOptions?: {
    price: number;
    serviceId: string;
  }[];
};

function bookingServices(booking: {
  service: LinkedService;
  services: LinkedService[];
}) {
  return booking.services.length ? booking.services : [booking.service];
}

function serviceVehiclePrice(
  service: LinkedService,
  vehicleCategoryId: string,
) {
  return (
    service.vehicleOptions?.find(
      (option) => option.vehicleCategoryId === vehicleCategoryId,
    )?.priceModifier ?? 0
  );
}

function addOnPrice(addOn: LinkedAddOn, serviceIds: string[]) {
  for (const serviceId of serviceIds) {
    const option = addOn.serviceOptions?.find(
      (serviceOption) => serviceOption.serviceId === serviceId,
    );

    if (option) return option.price;
  }

  return addOn.price;
}

function bookingAmount(booking: {
  addOns: LinkedAddOn[];
  invoice: { totalAmount: number } | null;
  promoDiscountAmount: number;
  service: LinkedService;
  services: LinkedService[];
  vehicleCategoryId: string;
}) {
  if (booking.invoice) return booking.invoice.totalAmount;

  const services = bookingServices(booking);
  const serviceIds = services.map((service) => service.id);
  const subtotal =
    services.reduce((sum, service) => sum + service.basePrice, 0) +
    services.reduce(
      (sum, service) =>
        sum + serviceVehiclePrice(service, booking.vehicleCategoryId),
      0,
    ) +
    booking.addOns.reduce((sum, addOn) => sum + addOnPrice(addOn, serviceIds), 0);

  return Math.max(0, subtotal - booking.promoDiscountAmount);
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
        client: true,
        promoCode: true,
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

  const formattedBookings = bookings.map((booking) => {
    const services = bookingServices(booking);
    const serviceIds = services.map((service) => service.id);
    const invoiceLanguage = normalizeInvoiceLanguage(booking.language);
    const vehiclePrice = services.reduce(
      (sum, service) =>
        sum + serviceVehiclePrice(service, booking.vehicleCategoryId),
      0,
    );

    return {
      basePrice: services.reduce((sum, service) => sum + service.basePrice, 0),
      bookingId: booking.id,
      businessAddress:
        booking.invoice?.businessAddress || "Sternmatt 4, 6242 Wauwil",
      clientAddress:
        booking.invoice?.clientAddress || booking.client.address || "",
      clientEmail: booking.invoice?.emailOverride || booking.client.email,
      clientName: booking.client.name,
      dateTime: booking.dateTime,
      draftItems: [
        ...services.map((service) => ({
          description: translateInvoiceItemDescription(
            service.name,
            invoiceLanguage,
          ),
          pricePerUnit: service.basePrice,
          quantity: 1,
          unit: "Stk.",
        })),
        ...(vehiclePrice > 0
          ? [
              {
                description: invoiceVehicleCategoryDescription(
                  booking.vehicleCategory.name,
                  invoiceLanguage,
                ),
                pricePerUnit: vehiclePrice,
                quantity: 1,
                unit: "Stk.",
              },
            ]
          : []),
        ...booking.addOns.map((addOn) => ({
          description: translateInvoiceItemDescription(
            addOn.name,
            invoiceLanguage,
          ),
          pricePerUnit: addOnPrice(addOn, serviceIds),
          quantity: 1,
          unit: "Stk.",
        })),
      ],
      invoice: booking.invoice,
      language: booking.language,
      modifierPrice: vehiclePrice,
      promoCode: booking.promoCode?.code || null,
      promoDiscountAmount: booking.promoDiscountAmount,
      promoDiscountPercent: booking.promoDiscountPercent,
      serviceName: services.map((service) => service.name).join(", "),
      suggestedInvoiceNumber: `RE-${booking.id
        .replace(/-/g, "")
        .slice(0, 10)
        .toUpperCase()}`,
      totalAmount: bookingAmount(booking),
    };
  });

  const metrics = {
    openRevenue,
    overduePayments,
    receivedThisMonth,
  };

  const totalPages = Math.max(1, Math.ceil(totalBookings / PAGE_SIZE));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Rechnungen</h1>
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
