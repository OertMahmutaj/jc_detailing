"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminNotification } from "./AdminNotificationProvider";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

type Props = {
  action: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
  }>;
  bookingId: string;
  initialStatus: BookingStatus;
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Offen",
  CONFIRMED: "Bestätigt",
  COMPLETED: "Erledigt",
  CANCELLED: "Storniert",
};

export function AdminBookingStatusForm({
  action,
  bookingId,
  initialStatus,
}: Props) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const [status, setStatus] = useState<BookingStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = await action(new FormData(event.currentTarget));

      if (!result.success) {
        showNotification(
          result.error || "Der Buchungsstatus konnte nicht gespeichert werden.",
          "error"
        );
        return;
      }

      showNotification("Buchungsstatus wurde gespeichert.", "success");

      router.refresh();
    } catch (error) {
      console.error("Booking status update failed:", error);

      showNotification(
        "Der Buchungsstatus konnte nicht gespeichert werden.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="id" type="hidden" value={bookingId} />

      <select
        className="admin-select"
        disabled={isSubmitting}
        name="status"
        onChange={(event) => setStatus(event.target.value as BookingStatus)}
        value={status}
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button
        className="admin-mini-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Speichert..." : "Speichern"}
      </button>
    </form>
  );
}