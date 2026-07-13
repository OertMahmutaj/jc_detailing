import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "../../_lib/supabaseAdmin";
import { AdminGalleryProjectEditor } from "../../_components/AdminGalleryProjectEditor";
import { deleteGalleryProject } from "../../_actions/galleryActions";
import { AdminGalleryProjectDeleteForm } from "../../_components/AdminGalleryProjectDeleteForm";

async function createPreviewUrl(storagePath: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(bookingPhotosBucket)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    console.error(
      `Gallery preview URL could not be created for ${storagePath}:`,
      error
    );

    return null;
  }

  return data.signedUrl;
}

export default async function AdminGalleryProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await prisma.galleryProject.findUnique({
    where: {
      id: projectId,
    },
    include: {
      booking: {
        select: {
          vehicleModel: true,
          client: {
            select: {
              name: true,
            },
          },
        },
      },
      comparisons: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          label: true,
          isPublished: true,
          sortOrder: true,
          beforeAsset: {
            select: {
              id: true,
              originalFileName: true,
              storagePath: true,
              cropX: true,
              cropY: true,
              cropScale: true,
            },
          },
          afterAsset: {
            select: {
              id: true,
              originalFileName: true,
              storagePath: true,
              cropX: true,
              cropY: true,
              cropScale: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const comparisons = await Promise.all(
    project.comparisons.map(async (comparison) => {
      const [beforeUrl, afterUrl] = await Promise.all([
        comparison.beforeAsset
          ? createPreviewUrl(comparison.beforeAsset.storagePath)
          : Promise.resolve(null),
        comparison.afterAsset
          ? createPreviewUrl(comparison.afterAsset.storagePath)
          : Promise.resolve(null),
      ]);

      return {
        id: comparison.id,
        label: comparison.label,
        isPublished: comparison.isPublished,
        sortOrder: comparison.sortOrder,
        beforeAsset: comparison.beforeAsset
          ? {
            id: comparison.beforeAsset.id,
            originalFileName: comparison.beforeAsset.originalFileName,
            url: beforeUrl,
            cropX: comparison.beforeAsset.cropX,
            cropY: comparison.beforeAsset.cropY,
            cropScale: comparison.beforeAsset.cropScale,
          }
          : null,
        afterAsset: comparison.afterAsset
          ? {
            id: comparison.afterAsset.id,
            originalFileName: comparison.afterAsset.originalFileName,
            url: afterUrl,
            cropX: comparison.afterAsset.cropX,
            cropY: comparison.afterAsset.cropY,
            cropScale: comparison.afterAsset.cropScale,
          }
          : null,
      };
    })
  );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-detail-heading">
          <Link className="admin-back-link" href="/admin/gallery">
            ← Zurück zur Galerie
          </Link>

          <span className="admin-page-kicker">GALERIE-PROJEKT</span>
          <h1>{project.title}</h1>
        </div>

        <p>
          {project.booking
            ? `Quelle: ${project.booking.client.name} · ${project.booking.vehicleModel}`
            : "Eigenständiges Galerie-Projekt ohne Buchung"}
        </p>
      </header>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <span>VORHER / NACHHER</span>
            <h2>Vergleiche verwalten</h2>
          </div>
        </div>

        <AdminGalleryProjectEditor
          comparisons={comparisons}
          projectId={project.id}
        />
      </section>
      <section className="admin-gallery-project-danger-zone">
        <div>
          <span>GEFAHRENBEREICH</span>
          <h2>Projekt dauerhaft entfernen</h2>
          <p>
            Alle Vergleiche und hochgeladenen Bilder dieses Projekts werden
            endgültig gelöscht.
          </p>
        </div>

        <AdminGalleryProjectDeleteForm
          action={deleteGalleryProject}
          projectId={project.id}
          projectTitle={project.title}
        />
      </section>
    </div>
  );
}
