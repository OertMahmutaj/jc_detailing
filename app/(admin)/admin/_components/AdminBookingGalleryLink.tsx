"use client";

import { useTransition } from "react";
import { ArrowUpRight, Images, LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getOrCreateGalleryProjectForBooking } from "../_actions/galleryActions";
import { useAdminNotification } from "./AdminNotificationProvider";

type GalleryProject = {
  id: string;
  title: string;
  comparisonCount: number;
} | null;

type AdminBookingGalleryLinkProps = {
  bookingId: string;
  galleryProject: GalleryProject;
};

export function AdminBookingGalleryLink({
  bookingId,
  galleryProject,
}: AdminBookingGalleryLinkProps) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();
  const [isPending, startTransition] = useTransition();

  function openGalleryProject() {
    if (galleryProject) {
      router.push(`/admin/gallery/${galleryProject.id}`);
      return;
    }

    startTransition(async () => {
      const result = await getOrCreateGalleryProjectForBooking(bookingId);

      if (!result.success) {
        showNotification(result.error, "error");
        return;
      }

      showNotification(result.message, "success");
      router.push(`/admin/gallery/${result.projectId}`);
      router.refresh();
    });
  }

  return (
    <div className="admin-booking-gallery-link">
      <div className="admin-booking-gallery-link-copy">
        <span>ÖFFENTLICHE GALERIE</span>

        <strong>
          {galleryProject
            ? galleryProject.title
            : "Noch kein Galerie-Projekt erstellt"}
        </strong>

        <p>
          {galleryProject
            ? `${galleryProject.comparisonCount} ${
                galleryProject.comparisonCount === 1
                  ? "Vergleich"
                  : "Vergleiche"
              } verwalten`
            : "Erstelle Vorher-Nachher-Vergleiche, veröffentliche sie und verwalte beide Bildseiten getrennt."}
        </p>
      </div>

      <button
        className="admin-booking-gallery-link-button"
        disabled={isPending}
        onClick={openGalleryProject}
        type="button"
      >
        {isPending ? (
          <>
            <LoaderCircle className="admin-spinner" size={16} />
            Wird erstellt...
          </>
        ) : galleryProject ? (
          <>
            <Images size={16} />
            Galerie öffnen
            <ArrowUpRight size={15} />
          </>
        ) : (
          <>
            <Plus size={16} />
            Galerie erstellen
          </>
        )}
      </button>
    </div>
  );
}