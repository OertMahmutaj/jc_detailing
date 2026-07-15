"use client";

import { Plus, Search, TicketPercent, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type PromoCodeRow = {
  id: string;
  code: string;
  discountPercent: number;
  expiresAt: string;
  isActive: boolean;
  maxUses: number;
  maxUsesPerClient: number;
  usageCount: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function PromoCodesClient({ promoCodes }: { promoCodes: PromoCodeRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filteredCodes = useMemo(() => {
    const normalized = query.trim().toUpperCase();
    return normalized
      ? promoCodes.filter((promo) => promo.code.includes(normalized))
      : promoCodes;
  }, [promoCodes, query]);

  async function createPromoCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message ?? "Promo-Code konnte nicht erstellt werden.");

      form.reset();
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Promo-Code konnte nicht erstellt werden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function togglePromoCode(promo: PromoCodeRow) {
    setMessage("");
    const response = await fetch("/api/admin/promo-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: promo.id, isActive: !promo.isActive }),
    });

    if (!response.ok) {
      const result = await response.json();
      setMessage(result.message ?? "Status konnte nicht geändert werden.");
      return;
    }

    router.refresh();
  }

  async function deletePromoCode(promo: PromoCodeRow) {
    if (!window.confirm(`${promo.code} wirklich löschen?`)) return;
    setMessage("");
    const response = await fetch(`/api/admin/promo-codes?id=${encodeURIComponent(promo.id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = await response.json();
      setMessage(result.message ?? "Promo-Code konnte nicht gelöscht werden.");
      return;
    }

    router.refresh();
  }

  return (
    <>
      <section className="admin-panel admin-promo-panel">
        <div className="admin-promo-toolbar">
          <label className="admin-promo-search">
            <Search size={17} />
            <input
              aria-label="Promo Codes suchen"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Promo-Code suchen..."
              type="search"
              value={query}
            />
          </label>
          <button className="admin-primary-button" onClick={() => setIsModalOpen(true)} type="button">
            <Plus size={17} /> Code erstellen
          </button>
        </div>

        {message && <p className="admin-promo-message" role="status">{message}</p>}

        <div className="admin-promo-list">
          {filteredCodes.map((promo) => {
            const expired = new Date(promo.expiresAt) <= new Date();
            return (
              <article className="admin-promo-row" key={promo.id}>
                <div className="admin-promo-icon"><TicketPercent size={20} /></div>
                <div className="admin-promo-main">
                  <div className="admin-promo-title-row">
                    <strong>{promo.code}</strong>
                    <span>{promo.discountPercent}% Rabatt</span>
                  </div>
                  <p>
                    {promo.usageCount}/{promo.maxUses} verwendet
                    <span>Max. {promo.maxUsesPerClient} pro Kunde</span>
                    <span>Ablauf {formatDate(promo.expiresAt)}</span>
                  </p>
                </div>
                <div className="admin-promo-actions">
                  <span className={`admin-promo-status ${promo.isActive && !expired ? "is-active" : ""}`}>
                    {expired ? "Abgelaufen" : promo.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                  <button
                    aria-label={`${promo.code} ${promo.isActive ? "deaktivieren" : "aktivieren"}`}
                    className={`admin-promo-switch ${promo.isActive && !expired ? "is-active" : ""}`}
                    disabled={expired}
                    onClick={() => togglePromoCode(promo)}
                    type="button"
                  ><span /></button>
                  <button
                    aria-label={`${promo.code} löschen`}
                    className="admin-icon-button is-danger"
                    onClick={() => deletePromoCode(promo)}
                    type="button"
                  ><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
          {!filteredCodes.length && <p className="admin-empty">Keine Promo Codes gefunden.</p>}
        </div>
      </section>

      {isModalOpen && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setIsModalOpen(false)}>
          <form className="admin-modal admin-promo-modal" onSubmit={createPromoCode} onMouseDown={(event) => event.stopPropagation()}>
            <button aria-label="Modal schliessen" className="admin-modal-close" onClick={() => setIsModalOpen(false)} type="button"><X size={18} /></button>
            <div className="admin-panel-head">
              <div><span>Marketing</span><h2>Promo-Code erstellen</h2></div>
            </div>
            <div className="admin-promo-form-grid">
              <label className="is-wide">Code<input autoFocus maxLength={40} name="code" placeholder="z. B. JCDETAILING10" required /></label>
              <label>Rabatt in Prozent<input max="100" min="0.01" name="discountPercent" required step="0.01" type="number" /></label>
              <label>Ablaufdatum<input name="expiresAt" required type="date" /></label>
              <label>Maximale Nutzungen insgesamt<input min="1" name="maxUses" required type="number" /></label>
              <label>Maximale Nutzungen pro Kunde<input min="1" name="maxUsesPerClient" required type="number" /></label>
            </div>
            {message && <p className="admin-promo-message" role="alert">{message}</p>}
            <div className="admin-promo-modal-actions">
              <button className="admin-secondary-button" onClick={() => setIsModalOpen(false)} type="button">Abbrechen</button>
              <button className="admin-primary-button" disabled={isSaving} type="submit">{isSaving ? "Wird erstellt..." : "Code erstellen"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
