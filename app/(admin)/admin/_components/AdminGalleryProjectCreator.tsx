"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createGalleryProject } from "../_actions/galleryActions";
import { useAdminNotification } from "./AdminNotificationProvider";

type BookingOption = {
  id: string;
  label: string;
};

type AdminGalleryProjectCreatorProps = {
  bookings: BookingOption[];
};

export function AdminGalleryProjectCreator({
  bookings,
}: AdminGalleryProjectCreatorProps) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createGalleryProject(formData);

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
    <form className="admin-gallery-create-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <label>
          <span>Projektname</span>
          <input
            defaultValue="Neues Galerie-Projekt"
            maxLength={120}
            name="title"
            placeholder="Zum Beispiel: BMW Innenreinigung"
            type="text"
          />
        </label>

        <label>
          <span>Optionale Buchung</span>
          <select defaultValue="" name="bookingId">
            <option value="">
              Ohne Buchung — eigenständiges Galerie-Projekt
            </option>

            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-gallery-create-actions">
        <p>
          Eine Buchung ist nur eine optionale Quelle. Das Galerie-Projekt
          bleibt bestehen, auch wenn die Buchung später gelöscht wird.
        </p>

        <button
          className="admin-submit-button"
          disabled={isPending}
          type="submit"
        >
          <Plus size={16} />
          {isPending ? "Wird erstellt..." : "Projekt erstellen"}
        </button>
      </div>
    </form>
  );
}