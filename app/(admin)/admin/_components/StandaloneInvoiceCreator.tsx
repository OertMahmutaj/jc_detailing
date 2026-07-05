"use client";

import { useState } from "react";
import { FilePlus2, X } from "lucide-react";

export function StandaloneInvoiceCreator({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="admin-submit-button admin-create-booking-button" onClick={() => setOpen(true)} type="button">
        <FilePlus2 size={16} /> Rechnung erstellen
      </button>

      {open && (
        <div className="admin-modal-backdrop" role="dialog" aria-label="Rechnung erstellen" aria-modal="true">
          <form action={action} className="admin-modal admin-calendar-modal" onSubmit={() => setOpen(false)}>
            <button className="admin-modal-close" onClick={() => setOpen(false)} type="button">
              <X size={22} />
            </button>
            <div className="admin-panel-head">
              <div>
                <span>Rechnung</span>
                <h2>Ohne Buchung erstellen</h2>
              </div>
            </div>
            <div className="admin-form-grid">
              <label>
                Kunde
                <input name="recipientName" required type="text" />
              </label>
              <label>
                E-Mail
                <input name="email" required type="email" />
              </label>
              <label>
                Beschreibung
                <input name="description" required type="text" />
              </label>
              <label>
                Betrag CHF
                <input min="1" name="amount" required step="0.05" type="number" />
              </label>
              <label>
                Sprache
                <select name="language" defaultValue="de">
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="fr">Francais</option>
                  <option value="it">Italiano</option>
                </select>
              </label>
            </div>
            <button className="admin-submit-button" type="submit">
              Rechnung senden
            </button>
          </form>
        </div>
      )}
    </>
  );
}
