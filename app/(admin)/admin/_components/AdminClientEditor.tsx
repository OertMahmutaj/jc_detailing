"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteClient, updateClient } from "../clients/actions";
import { useAdminNotification } from "./AdminNotificationProvider";

type AdminClientEditorProps = {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};

export function AdminClientEditor({ client }: AdminClientEditorProps) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isDeleteModalOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isDeleteModalOpen]);

  function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateClient(formData);

      if (!result.success) {
        showNotification(result.error, "error");
        return;
      }

      showNotification(result.message, "success");
      router.refresh();
    });
  }

  function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await deleteClient(formData);

      if (!result.success) {
        showNotification(result.error, "error");
        return;
      }

      setIsDeleteModalOpen(false);
      showNotification(result.message, "success");

      router.push("/admin/clients");
      router.refresh();
    });
  }

  return (
    <>
      <div className="admin-client-editor">
        <form className="admin-client-form" onSubmit={handleUpdate}>
          <input type="hidden" name="clientId" value={client.id} />

          <div className="admin-form-grid">
            <label>
              <span>Name</span>
              <input
                type="text"
                name="name"
                defaultValue={client.name}
                required
              />
            </label>

            <label>
              <span>E-Mail</span>
              <input
                type="email"
                name="email"
                defaultValue={client.email}
                required
              />
            </label>

            <label>
              <span>Telefon</span>
              <input
                type="tel"
                name="phone"
                defaultValue={client.phone}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={isPending}
          >
            {isPending ? "Wird gespeichert..." : "Änderungen speichern"}
          </button>
        </form>

        <div className="admin-danger-zone">
          <div>
            <strong>Kunde löschen</strong>
            <p>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle
              zugehörigen Buchungen und Rechnungen werden ebenfalls gelöscht.
            </p>
          </div>

          <button
            type="button"
            className="admin-danger-button"
            disabled={isPending}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Kunde endgültig löschen
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Kunde löschen"
        >
          <form
            className="admin-modal admin-delete-confirmation-modal"
            onSubmit={handleDelete}
          >
            <input type="hidden" name="clientId" value={client.id} />

            <button
              aria-label="Modal schließen"
              className="admin-modal-close"
              disabled={isPending}
              onClick={() => setIsDeleteModalOpen(false)}
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
                  Kunde löschen
                </span>

                <h2>Kunde wirklich löschen?</h2>

                <p>
                  <strong>{client.name}</strong> wird dauerhaft entfernt.
                  Zugehörige Buchungen, Rechnungen und Rechnungspositionen
                  werden ebenfalls gelöscht.
                </p>
              </div>
            </div>

            <div className="admin-delete-confirmation-actions">
              <button
                className="admin-secondary-button"
                disabled={isPending}
                onClick={() => setIsDeleteModalOpen(false)}
                type="button"
              >
                Nein, behalten
              </button>

              <button
                className="admin-danger-button"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Wird gelöscht..." : "Ja, Kunde löschen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}