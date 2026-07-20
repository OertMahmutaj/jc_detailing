import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../_lib/prisma";
import { getAdminBookingCatalog } from "../../_lib/bookingCatalog";
import { AdminBookingEditor } from "../../_components/AdminBookingEditor";

export default async function AdminBookingDetailPage({
    params,
}: {
    params: Promise<{ bookingId: string }>;
}) {
    const { bookingId } = await params;

    const [booking, catalog] = await Promise.all([
        prisma.booking.findUnique({
            where: {
                id: bookingId,
            },
            include: {
                client: true,
                service: true,
                services: true,
                vehicleCategory: true,
                addOns: true,
                invoice: {
                    include: {
                        items: true,
                    },
                },
                galleryProjects: {
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: {
                                comparisons: true,
                            },
                        },
                    },
                    take: 1,
                },
            },
        }),
        getAdminBookingCatalog(),
    ]);
    const { addOns, categories: vehicleCategories, services } = catalog;

    if (!booking) {
        notFound();
    }

    return (
        <div className="admin-page">
            <header className="admin-page-header">
                <div className="admin-detail-heading">
                    <Link href="/admin/bookings" className="admin-back-link">
                        ← Zurück zu Buchungen
                    </Link>

                    <h1>Buchung bearbeiten</h1>
                </div>
                <p>
                    {booking.client.name} · {booking.client.email}
                </p>
            </header>

            <section className="admin-panel">
                <div className="admin-panel-head">
                    <div>
                        <h2>Buchungsdetails</h2>
                        <p>
                            Kunde: {booking.client.name} · {booking.client.phone}
                        </p>
                    </div>
                </div>

                <AdminBookingEditor
                    booking={{
                        id: booking.id,
                        dateTime: booking.dateTime.toISOString(),
                        endTime: booking.endTime.toISOString(),
                        status: booking.status,
                        vehicleModel: booking.vehicleModel,
                        notes: booking.notes,
                        serviceId: booking.serviceId,
                        vehicleCategoryId: booking.vehicleCategoryId,
                        serviceIds: booking.services.map((service) => service.id),
                        addOnIds: booking.addOns.map((addOn) => addOn.id),
                        galleryProject: booking.galleryProjects[0]
                            ? {
                                id: booking.galleryProjects[0].id,
                                title: booking.galleryProjects[0].title,
                                comparisonCount: booking.galleryProjects[0]._count.comparisons,
                            }
                            : null,
                        client: {
                            name: booking.client.name,
                            email: booking.client.email,
                            phone: booking.client.phone,
                        },

                    }}
                    services={services}
                    vehicleCategories={vehicleCategories}
                    addOns={addOns}
                />
            </section>
        </div>
    );
}
