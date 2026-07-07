"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminNotification } from "./AdminNotificationProvider";

type Props = {
  action: (formData: FormData) => Promise<void>;
  bookingId: string;
  clientName: string;
};

export function AdminBookingDeleteForm({
  action,
  bookingId,
  clientName,
}: Props) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);

        setIsOpen(false);
        showNotification(
          `Buchung von ${clientName} wurde gelöscht.`,
          "success"
        );
        router.refresh();
      } catch (error) {
        console.error("Booking deletion failed:", error);

        showNotification(
          "Die Buchung konnte nicht gelöscht werden. Bitte versuche es erneut.",
          "error"
        );
      }
    });
  }

  return (
    <>
      <button
        className="admin-danger-button admin-booking-delete-trigger"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Löschen
      </button>

      {isOpen && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Buchung löschen"
        >
          <form
            className="admin-modal admin-delete-confirmation-modal"
            onSubmit={handleDelete}
          >
            <input name="id" type="hidden" value={bookingId} />

            <button
              aria-label="Modal schließen"
              className="admin-modal-close"
              disabled={isPending}
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X size={20} />
            </button>

            <div className="admin-delete-confirmation-content">
              <span className="admin-delete-confirmation-icon">
                <AlertTriangle size={24} />
              </span>

              <div>
                <span className="admin-delete-confirmation-eyebrow">
                  Buchung löschen
                </span>

                <h2>Buchung wirklich löschen?</h2>

                <p>
                  Die Buchung von <strong>{clientName}</strong> wird dauerhaft
                  entfernt. Eine vorhandene Rechnung wird ebenfalls gelöscht.
                </p>
              </div>
            </div>

            <div className="admin-delete-confirmation-actions">
              <button
                className="admin-secondary-button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Nein, behalten
              </button>

              <button
                className="admin-danger-button"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Wird gelöscht..." : "Ja, löschen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}