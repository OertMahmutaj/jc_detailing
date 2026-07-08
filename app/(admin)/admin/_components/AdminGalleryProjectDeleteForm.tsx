"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminNotification } from "./AdminNotificationProvider";

type DeleteActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type AdminGalleryProjectDeleteFormProps = {
  action: (formData: FormData) => Promise<DeleteActionResult>;
  projectId: string;
  projectTitle: string;
};

export function AdminGalleryProjectDeleteForm({
  action,
  projectId,
  projectTitle,
}: AdminGalleryProjectDeleteFormProps) {
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

  function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await action(formData);

        if (!result.success) {
          showNotification(result.error, "error");
          return;
        }

        setIsOpen(false);

        showNotification(result.message, "success");

        router.push("/admin/gallery");
        router.refresh();
      } catch (error) {
        console.error("Gallery project deletion failed:", error);

        showNotification(
          "Das Galerie-Projekt konnte nicht gelöscht werden.",
          "error"
        );
      }
    });
  }

  return (
    <>
      <button
        className="admin-danger-button"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Trash2 size={16} />
        Projekt löschen
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
          <form
            className="admin-delete-confirmation"
            onSubmit={handleDelete}
          >
            <input name="projectId" type="hidden" value={projectId} />

            <button
              aria-label="Dialog schließen"
              className="admin-delete-confirmation-close"
              disabled={isPending}
              onClick={closeModal}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="admin-delete-confirmation-content">
              <AlertTriangle size={24} />

              <div>
                <span>ENDGÜLTIG LÖSCHEN</span>
                <h2>Galerie-Projekt löschen?</h2>

                <p>
                  <strong>{projectTitle}</strong> wird inklusive aller
                  Vergleiche, Bilder und Veröffentlichungen dauerhaft
                  gelöscht.
                </p>

                <p>
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
            </div>

            <div className="admin-delete-confirmation-actions">
              <button
                className="admin-secondary-button"
                disabled={isPending}
                onClick={closeModal}
                type="button"
              >
                Abbrechen
              </button>

              <button
                className="admin-danger-button"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Wird gelöscht..." : "Endgültig löschen"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}