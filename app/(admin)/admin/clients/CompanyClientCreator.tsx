"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, X } from "lucide-react";

export default function CompanyClientCreator() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/company-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: formData.get("address"),
          email: formData.get("email"),
          name: formData.get("name"),
          phone: formData.get("phone"),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ?? "Der Firmenkunde konnte nicht erstellt werden.",
        );
      }

      form.reset();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Der Firmenkunde konnte nicht erstellt werden.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        className="admin-primary-button"
        onClick={() => {
          setMessage("");
          setIsOpen(true);
        }}
        type="button"
      >
        <Plus size={16} />
        Firmenkunde hinzufügen
      </button>

      {isOpen && (
        <div
          aria-modal="true"
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !isSaving) {
              setIsOpen(false);
            }
          }}
          role="dialog"
        >
          <section className="admin-modal admin-service-modal">
            <header className="admin-modal-header">
              <div>
                <span className="admin-page-kicker">Firmenkunden</span>
                <h2>Firmenkunde hinzufügen</h2>
              </div>
              <button
                aria-label="Schliessen"
                className="admin-modal-close"
                disabled={isSaving}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="admin-service-create-grid">
                <label>
                  Firmenname
                  <input name="name" required type="text" />
                </label>
                <label>
                  E-Mail
                  <input name="email" required type="email" />
                </label>
                <label>
                  Telefon
                  <input name="phone" required type="tel" />
                </label>
                <label>
                  Rechnungsadresse
                  <input name="address" required type="text" />
                </label>
              </div>

              {message && <p className="admin-form-message is-error">{message}</p>}

              <div className="admin-service-modal-actions">
                <button
                  className="admin-secondary-button"
                  disabled={isSaving}
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Abbrechen
                </button>
                <button
                  className="admin-primary-button"
                  disabled={isSaving}
                  type="submit"
                >
                  <Building2 size={16} />
                  {isSaving ? "Wird gespeichert..." : "Firmenkunde speichern"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
