"use client";

import { useState, useTransition } from "react";
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
  const [isDeleting, setIsDeleting] = useState(false);

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

    const confirmed = window.confirm(
      `Kunde "${client.name}" wirklich löschen?\n\nDadurch werden auch alle Buchungen, Rechnungen und Rechnungspositionen dieses Kunden gelöscht.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await deleteClient(formData);

      if (!result.success) {
        setIsDeleting(false);
        showNotification(result.error, "error");
        return;
      }

      showNotification(result.message, "success");

      router.push("/admin/clients");
      router.refresh();
    });
  }

  return (
    <div className="admin-client-editor">
      <form className="admin-client-form" onSubmit={handleUpdate}>
        <input type="hidden" name="clientId" value={client.id} />

        <div className="admin-form-grid">
          <label>
            <span>Name</span>
            <input type="text" name="name" defaultValue={client.name} required />
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
            <input type="tel" name="phone" defaultValue={client.phone} required />
          </label>
        </div>

        <button
          type="submit"
          className="admin-primary-button"
          disabled={isPending || isDeleting}
        >
          {isPending && !isDeleting
            ? "Wird gespeichert..."
            : "Änderungen speichern"}
        </button>
      </form>

      <form className="admin-danger-zone" onSubmit={handleDelete}>
        <input type="hidden" name="clientId" value={client.id} />

        <div>
          <strong>Kunde löschen</strong>
          <p>
            Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen
            Buchungen und Rechnungen werden ebenfalls gelöscht.
          </p>
        </div>

        <button
          type="submit"
          className="admin-danger-button"
          disabled={isPending || isDeleting}
        >
          {isDeleting ? "Wird gelöscht..." : "Kunde endgültig löschen"}
        </button>
      </form>
    </div>
  );
}