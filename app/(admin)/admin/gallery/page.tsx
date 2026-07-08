import Link from "next/link";
import { ImagePlus, Layers3 } from "lucide-react";
import { prisma } from "../_lib/prisma";
import { AdminGalleryProjectCreator } from "../_components/AdminGalleryProjectCreator";
import { BookingPhotoCategory } from "@prisma/client";
import { AdminLegacyBookingPhotoMigration } from "../_components/AdminLegacyBookingPhotoMigration";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export default async function AdminGalleryPage() {
  const [projects, bookings, legacyPhotoCount] = await Promise.all([
  prisma.galleryProject.findMany({
    include: {
      booking: {
        select: {
          id: true,
          dateTime: true,
          vehicleModel: true,
          client: {
            select: {
              name: true,
            },
          },
        },
      },
      comparisons: {
        select: {
          beforeAssetId: true,
          afterAssetId: true,
          isPublished: true,
        },
      },
      _count: {
        select: {
          mediaAssets: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  }),

  prisma.booking.findMany({
    where: {
      status: {
        not: "CANCELLED",
      },
    },
    select: {
      id: true,
      dateTime: true,
      vehicleModel: true,
      client: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      dateTime: "desc",
    },
    take: 100,
  }),

  prisma.bookingPhoto.count({
    where: {
      category: {
        in: [
          BookingPhotoCategory.BEFORE,
          BookingPhotoCategory.AFTER,
        ],
      },
    },
  }),
]);

  const bookingOptions = bookings.map((booking) => ({
    id: booking.id,
    label: `${formatDate(booking.dateTime)} · ${booking.client.name} · ${booking.vehicleModel}`,
  }));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <span className="admin-page-kicker">MEDIEN & GALERIE</span>
        <h1>Galerie</h1>
        <p>
          Erstelle unabhängige Vorher-Nachher-Projekte oder verknüpfe sie
          optional mit einer bestehenden Buchung.
        </p>
      </header>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <span>NEUES PROJEKT</span>
            <h2>Galerie-Projekt erstellen</h2>
          </div>

          <ImagePlus size={20} />
        </div>

        <AdminGalleryProjectCreator bookings={bookingOptions} />
      </section>
      {legacyPhotoCount ? (
  <section className="admin-gallery-migration-panel">
    <div>
      <span>BESTEHENDE BUCHUNGSFOTOS</span>
      <h2>{legacyPhotoCount} Fotos warten auf die Übernahme</h2>
      <p>
        Übertrage ältere Vorher-/Nachher-Fotos in den neuen Gallery Manager,
        damit sie dort einzeln ersetzt, gelöscht und veröffentlicht werden
        können.
      </p>
    </div>

    <AdminLegacyBookingPhotoMigration
      legacyPhotoCount={legacyPhotoCount}
    />
  </section>
) : null}

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <span>ÜBERSICHT</span>
            <h2>Galerie-Projekte</h2>
          </div>

          <Layers3 size={20} />
        </div>

        {projects.length ? (
          <div className="admin-gallery-project-list">
            {projects.map((project) => {
              const readyComparisons = project.comparisons.filter(
                (comparison) =>
                  Boolean(comparison.beforeAssetId) &&
                  Boolean(comparison.afterAssetId)
              ).length;

              const publishedComparisons = project.comparisons.filter(
                (comparison) => comparison.isPublished
              ).length;

              return (
                <Link
                  className="admin-gallery-project-row"
                  href={`/admin/gallery/${project.id}`}
                  key={project.id}
                >
                  <div className="admin-gallery-project-copy">
                    <strong>{project.title}</strong>

                    <span>
                      {project.booking
                        ? `Quelle: ${project.booking.client.name} · ${project.booking.vehicleModel}`
                        : "Eigenständiges Galerie-Projekt"}
                    </span>
                  </div>

                  <div className="admin-gallery-project-meta">
                    <span>
                      {readyComparisons}{" "}
                      {readyComparisons === 1
                        ? "fertiger Vergleich"
                        : "fertige Vergleiche"}
                    </span>

                    <span>
                      {publishedComparisons}{" "}
                      {publishedComparisons === 1
                        ? "veröffentlicht"
                        : "veröffentlicht"}
                    </span>

                    <small>
                      {project._count.mediaAssets}{" "}
                      {project._count.mediaAssets === 1
                        ? "Bild"
                        : "Bilder"}
                    </small>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="admin-gallery-empty">
            <strong>Noch keine Galerie-Projekte</strong>
            <p>
              Erstelle ein Projekt, um eigenständige oder buchungsbezogene
              Vorher-Nachher-Vergleiche zu verwalten.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}