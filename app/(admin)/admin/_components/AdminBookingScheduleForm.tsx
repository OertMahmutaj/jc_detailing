"use client";

import { useState } from "react";
import { useAdminNotification } from "./AdminNotificationProvider";

type Props = {
  action: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
  }>;
  bookingId: string;
  date: string;
  time: string;
};

export function AdminBookingScheduleForm({
  action,
  bookingId,
  date,
  time,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useAdminNotification();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = await action(new FormData(event.currentTarget));

      if (!result.success) {
        showNotification(
          result.error || "Die Buchung konnte nicht verschoben werden.",
          "error"
        );
        return;
      }

      showNotification("Termin wurde erfolgreich geändert.", "success");
    } catch (error) {
      console.error("Booking schedule update failed:", error);

      showNotification(
        "Die Buchung konnte nicht verschoben werden.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-inline-form" onSubmit={handleSubmit}>
      <input name="id" type="hidden" value={bookingId} />

      <input
        defaultValue={date}
        name="date"
        required
        type="date"
      />

      <input
        defaultValue={time}
        max="19:30"
        min="08:00"
        name="time"
        required
        step="1800"
        type="time"
      />

      <button
        className="admin-mini-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Wird geändert..." : "Ändern"}
      </button>
    </form>
  );
}