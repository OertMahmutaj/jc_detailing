"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  LoaderCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { migrateLegacyBookingPhotos } from "../_actions/galleryActions";
import { useAdminNotification } from "./AdminNotificationProvider";

type AdminLegacyBookingPhotoMigrationProps = {
  legacyPhotoCount: number;
};

export function AdminLegacyBookingPhotoMigration({
  legacyPhotoCount,
}: AdminLegacyBookingPhotoMigrationProps) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending]);

  function closeModal() {
    if (!isPending) {
      setIsOpen(false);
    }
  }

  function handleMigration() {
    startTransition(async () => {
      const result = await migrateLegacyBookingPhotos();

      if (!result.success) {
        showNotification(result.error, "error");
        return;
      }

      setIsOpen(false);
      showNotification(result.message, "success");

      router.refresh();
    });
  }

  return (
    <>
      <button
        className="admin-gallery-migration-trigger"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <ArrowRightLeft size={16} />
        Bestehende Fotos übernehmen
      </button>

      {isOpen ? (
        <div
          aria-modal="true"
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
          role="dialog"
        >
          <div className="admin-gallery-migration-modal">
            <button
              aria-label="Dialog schließen"
              className="admin-gallery-migration-close"
              disabled={isPending}
              onClick={closeModal}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="admin-gallery-migration-content">
              <AlertTriangle size={24} />

              <div>
                <span>BESTEHENDE FOTOS ÜBERNEHMEN</span>
                <h2>Alte Buchungsfotos migrieren?</h2>

                <p>
                  <strong>{legacyPhotoCount} Vorher-/Nachher-Fotos</strong>{" "}
                  werden in editierbare Galerie-Projekte übertragen.
                </p>

                <p>
                  Die Originaldateien bleiben unverändert in Supabase Storage.
                  Schäden- und Dokumentationsfotos bleiben bei ihren Buchungen.
                </p>

                <p>
                  Bereits veröffentlichte, vollständige Paare bleiben
                  veröffentlicht. Unvollständige Paare werden als Entwurf
                  übernommen.
                </p>
              </div>
            </div>

            <div className="admin-gallery-migration-actions">
              <button
                className="admin-secondary-button"
                disabled={isPending}
                onClick={closeModal}
                type="button"
              >
                Abbrechen
              </button>

              <button
                className="admin-gallery-migration-confirm"
                disabled={isPending}
                onClick={handleMigration}
                type="button"
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="admin-spinner" size={16} />
                    Wird übernommen...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={16} />
                    Fotos übernehmen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}