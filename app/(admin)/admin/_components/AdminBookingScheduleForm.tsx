"use client";

import { useEffect, useState } from "react";
import { CalendarClock, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useAdminNotification();

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

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

      setIsOpen(false);
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
    <>
      <button
        className="admin-mini-button admin-booking-schedule-trigger"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <CalendarClock size={15} />
        Termin ändern
      </button>

      {isOpen && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-label="Termin ändern"
          aria-modal="true"
        >
          <form
            className="admin-modal admin-booking-schedule-modal"
            onSubmit={handleSubmit}
          >
            <button
              className="admin-modal-close"
              disabled={isSubmitting}
              onClick={() => setIsOpen(false)}
              type="button"
              aria-label="Modal schließen"
            >
              <X size={20} />
            </button>

            <div className="admin-panel-head">
              <div>
                <span>Termin</span>
                <h2>Termin ändern</h2>
              </div>
            </div>

            <div className="admin-booking-schedule-modal-content">
              <input name="id" type="hidden" value={bookingId} />

              <label>
                Datum
                <input
                  defaultValue={date}
                  name="date"
                  required
                  type="date"
                />
              </label>

              <label>
                Startzeit
                <input
                  defaultValue={time}
                  max="19:30"
                  min="08:00"
                  name="time"
                  required
                  step="1800"
                  type="time"
                />
              </label>
            </div>

            <div className="admin-booking-schedule-modal-actions">
              <button
                className="admin-secondary-button"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Abbrechen
              </button>

              <button
                className="admin-submit-button"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Wird gespeichert..." : "Termin speichern"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}