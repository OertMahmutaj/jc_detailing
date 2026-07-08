"use client";

import { Mail, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAdminNotification } from "../../_components/AdminNotificationProvider";

interface Item {
  description: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
}

interface InvoiceEditorProps {
  initialData: {
    basePrice: number;
    bookingId?: string | null;
    invoiceId?: string | null;
    clientEmail: string;
    invoiceNumber: string;
    items?: any[];
    language?: string | null;
    modifierPrice: number;
    serviceName: string;
  };
  onSaved?: () => void;
}

type InvoiceSendResponse = {
  error?: string;
  pdfUrl?: string | null;
  success?: boolean;
};

function formatCurrency(value: number) {
  const fixedValue = Number.isFinite(value) ? value : 0;
  const [whole, cents] = fixedValue.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, "'");

  return `CHF ${grouped}.${cents}`;
}

export default function InvoiceEditor({
  initialData,
  onSaved,
}: InvoiceEditorProps) {
  const { showNotification } = useAdminNotification();

  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData.invoiceNumber,
  );
  const [language, setLanguage] = useState(initialData.language || "de");
  const [targetEmail, setTargetEmail] = useState(initialData.clientEmail);
  const [vatRate, setVatRate] = useState(8.1);
  const [isSending, setIsSending] = useState(false);

  const [items, setItems] = useState<Item[]>(
    initialData.items && initialData.items.length > 0
      ? initialData.items.map((item: any) => ({
          description: item.description || "",
          pricePerUnit: Number(item.pricePerUnit) || 0,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "Stk.",
        }))
      : [
          {
            description: initialData.serviceName || "Rechnung ohne Buchung",
            pricePerUnit: initialData.basePrice + initialData.modifierPrice,
            quantity: 1,
            unit: "Stk.",
          },
        ],
  );

  const netAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.pricePerUnit,
    0,
  );
  const vatAmount = netAmount * (vatRate / 100);
  const totalAmount = netAmount + vatAmount;

  function addItem() {
    setItems([
      ...items,
      {
        description: "Zusatzleistung",
        pricePerUnit: 0,
        quantity: 1,
        unit: "Stk.",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateItem(index: number, field: keyof Item, value: string | number) {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setItems(updated);
  }

  async function handleSendInvoice() {
    if (isSending) return;

    if (!invoiceNumber.trim()) {
      showNotification("Bitte gib eine Rechnungsnummer ein.", "error");
      return;
    }

    if (!targetEmail.trim()) {
      showNotification("Bitte gib eine Empfänger-E-Mail ein.", "error");
      return;
    }

    if (!items.length) {
      showNotification("Bitte füge mindestens eine Position hinzu.", "error");
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch("/api/admin/invoices/send", {
        body: JSON.stringify({
          bookingId: initialData.bookingId || null,
          invoiceId: initialData.invoiceId || null,
          invoiceNumber,
          items,
          language,
          targetEmail,
          totalAmount,
          vatRate,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response
        .json()
        .catch(() => null)) as InvoiceSendResponse | null;

      if (!response.ok) {
        showNotification(
          data?.error || "Rechnung konnte nicht gesendet werden.",
          "error",
        );
        return;
      }

      showNotification("Rechnung wurde erfolgreich gesendet.", "success");
      onSaved?.();
    } catch (error) {
      console.error("Invoice sending failed:", error);

      showNotification("Rechnung konnte nicht gesendet werden.", "error");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="admin-panel admin-invoice-editor">
      <div className="admin-panel-head">
        <h2>Rechnung bearbeiten</h2>
      </div>

      <div className="admin-invoice-editor-grid">
        <div>
          <div className="admin-form-grid">
            <label>
              Rechnungsnummer
              <input
                value={invoiceNumber}
                onChange={(event) => setInvoiceNumber(event.target.value)}
              />
            </label>

            <label>
              Empfänger-E-Mail
              <input
                type="email"
                value={targetEmail}
                onChange={(event) => setTargetEmail(event.target.value)}
              />
            </label>

            <label>
              Mehrwertsteuer
              <input
                step="0.1"
                type="number"
                value={vatRate}
                onChange={(event) =>
                  setVatRate(parseFloat(event.target.value) || 0)
                }
              />
            </label>

            <label>
              Sprache
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
              </select>
            </label>
          </div>

          <div className="admin-invoice-items">
            <span>Positionen</span>

            {items.map((item, index) => (
              <div className="admin-invoice-item" key={index}>
                <input
                  placeholder="Beschreibung"
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, "description", event.target.value)
                  }
                />

                <div className="admin-invoice-item-meta">
                  <input
                    placeholder="Menge"
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "quantity",
                        parseFloat(event.target.value) || 0,
                      )
                    }
                  />

                  <input
                    placeholder="Einheit"
                    value={item.unit}
                    onChange={(event) =>
                      updateItem(index, "unit", event.target.value)
                    }
                  />

                  <input
                    placeholder="Preis"
                    type="number"
                    value={item.pricePerUnit}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "pricePerUnit",
                        parseFloat(event.target.value) || 0,
                      )
                    }
                  />

                  <button
                    className="admin-icon-danger"
                    disabled={items.length === 1}
                    onClick={() => removeItem(index)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button
              className="admin-inline-button"
              onClick={addItem}
              type="button"
            >
              <Plus size={14} /> Position hinzufügen
            </button>
          </div>

          <div className="admin-total-box">
            <div>
              Netto: <strong>{formatCurrency(netAmount)}</strong>
            </div>
            <div>
              MwSt. {vatRate}%: <strong>{formatCurrency(vatAmount)}</strong>
            </div>
            <div>
              Gesamt: <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </div>

          <div className="admin-submit-actions">
            <button
              className="admin-submit-button"
              disabled={isSending}
              onClick={handleSendInvoice}
              type="button"
            >
              <Mail size={16} />{" "}
              {isSending
                ? "Wird verarbeitet..."
                : "Rechnung per E-Mail senden"}
            </button>
          </div>
        </div>

        <aside className="admin-pdf-preview">
          <div className="admin-pdf-sheet">
            <header>
              <div>
                <strong>JC Detailing</strong>
                <span>Wauwil, Luzern</span>
              </div>
              <div>
                <span>Rechnung</span>
                <strong>{invoiceNumber}</strong>
              </div>
            </header>

            <section>
              <span>Empfänger</span>
              <strong>{targetEmail}</strong>
            </section>

            <table>
              <tbody>
                {items.map((item, index) => (
                  <tr key={`${item.description}-${index}`}>
                    <td>{item.description || "Position"}</td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>
                      {formatCurrency(item.quantity * item.pricePerUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer>
              <div>
                <span>Netto</span>
                <strong>{formatCurrency(netAmount)}</strong>
              </div>
              <div>
                <span>MwSt.</span>
                <strong>{formatCurrency(vatAmount)}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
}