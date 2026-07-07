"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Check, ChevronDown, ExternalLink, X } from "lucide-react";
import InvoiceEditor from "./InvoiceEditor";
import { AdminInvoiceActionMenu } from "../../_components/AdminInvoiceActionMenu";


type InvoiceBooking = {
  basePrice: number;
  bookingId?: string | null;
  clientEmail: string;
  clientName: string;
  dateTime?: Date | string | null;
  invoice?: {
    dueDate: Date | string;
    id: string;
    invoiceNumber: string;
    items?: any[];
    paidAt?: Date | string | null;
    pdfUrl?: string | null;
    reminderSentAt?: Date | string | null;
    sentAt?: Date | string | null;
    language?: string | null;
    status: "SENT" | "PAID";
    totalAmount: number;
  } | null;
  modifierPrice: number;
  serviceName: string;
};

type InvoiceMetrics = {
  openRevenue: number;
  overduePayments: number;
  receivedThisMonth: number;
};

const statusLabels = {
  PAID: "Bezahlt",
  SENT: "Gesendet",
} as const;

function formatCurrency(value: number) {
  const fixedValue = Number.isFinite(value) ? value : 0;
  const [whole, cents] = fixedValue.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, "'");

  return `CHF ${grouped}.${cents}`;
}

function formatSwissDate(value?: Date | string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function isInvoiceOverdue(invoice: InvoiceBooking["invoice"]) {
  if (!invoice || invoice.status === "PAID") return false;

  return new Date(invoice.dueDate).getTime() < Date.now();
}

function getRowKey(booking: InvoiceBooking) {
  return booking.bookingId || booking.invoice?.id || `${booking.clientEmail}-${booking.invoice?.invoiceNumber}`;
}

export default function InvoicesDashboardClient({
  bookings,
  metrics,
}: {
  bookings: InvoiceBooking[];
  metrics: InvoiceMetrics;
}) {
  const router = useRouter();
  const [selectedBooking, setSelectedBooking] = useState<InvoiceBooking | null>(null);
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [isWorking, setIsWorking] = useState<string | null>(null);

  const visibleBookings = bookings.filter((booking) => {
    if (!showUnpaidOnly) return true;
    return Boolean(booking.invoice && booking.invoice.status !== "PAID");
  });

  async function runInvoiceAction(endpoint: string, invoiceId: string, body?: Record<string, string>) {
    setIsWorking(invoiceId);

    const response = await fetch(endpoint, {
      body: JSON.stringify({ invoiceId, ...body }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const data = await response.json().catch(() => null);

    setIsWorking(null);

    if (!response.ok) {
      alert(data?.error || "Aktion konnte nicht ausgefuehrt werden.");
      return;
    }

    router.refresh();
  }

  return (
    <>
      <section className="admin-metrics-grid">
        <article className="admin-metric-card">
          <span>Offener Umsatz</span>
          <strong>{formatCurrency(metrics.openRevenue)}</strong>
          <small>Gesendete, noch offene Rechnungen</small>
        </article>

        <article className="admin-metric-card is-success">
          <span>Erhalten diesen Monat</span>
          <strong>{formatCurrency(metrics.receivedThisMonth)}</strong>
          <small>Bezahlt seit Monatsbeginn</small>
        </article>

        <article className="admin-metric-card is-danger">
          <span>Ueberfaellige Zahlungen</span>
          <strong>{formatCurrency(metrics.overduePayments)}</strong>
          <small>Offen nach Faelligkeitsdatum</small>
        </article>
      </section>

      <div className="admin-panel admin-invoice-bookings">
        <div className="admin-panel-head">
          <h2>Waehle eine Buchung zum Bearbeiten</h2>

          <button
            className={`admin-filter-toggle ${showUnpaidOnly ? "is-active" : ""}`}
            onClick={() => setShowUnpaidOnly((current) => !current)}
            type="button"
          >
            Nur offene anzeigen
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table admin-invoices-table">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Service</th>
                <th>Datum</th>
                <th>Status</th>
                <th>Aktion</th>
              </tr>
            </thead>

            <tbody>
              {visibleBookings.map((booking) => (
                <tr key={getRowKey(booking)}>
                  <td>
                    <strong>{booking.clientName}</strong>
                    <span>{booking.clientEmail}</span>
                  </td>

                  <td>{booking.serviceName}</td>

                  <td>{formatSwissDate(booking.dateTime)}</td>

                  <td>
                    <span className={`admin-status-pill is-${booking.invoice?.status?.toLowerCase() || "missing"}`}>
                      {booking.invoice ? statusLabels[booking.invoice.status] : "Keine Rechnung"}
                    </span>

                    {booking.invoice && <span>{booking.invoice.invoiceNumber}</span>}
                  </td>

                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-action-button" onClick={() => setSelectedBooking(booking)} type="button">
                        {booking.invoice ? "Bearbeiten" : "Erstellen"}
                      </button>

                      {booking.invoice && booking.invoice.status !== "PAID" && (
                        <AdminInvoiceActionMenu>
                          {booking.invoice.pdfUrl && (
                            <a
                              href={booking.invoice.pdfUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <ExternalLink size={15} />
                              Original PDF
                            </a>
                          )}

                          <button
                            disabled={isWorking === booking.invoice.id}
                            onClick={() =>
                              runInvoiceAction("/api/admin/invoices/status", booking.invoice!.id, {
                                status: "PAID",
                              })
                            }
                            type="button"
                          >
                            <Check size={15} />
                            Als bezahlt markieren
                          </button>

                          <button
                            disabled={
                              isWorking === booking.invoice.id ||
                              !isInvoiceOverdue(booking.invoice)
                            }
                            onClick={() =>
                              runInvoiceAction(
                                "/api/admin/invoices/reminder",
                                booking.invoice!.id
                              )
                            }
                            title={
                              isInvoiceOverdue(booking.invoice)
                                ? "Erinnerung senden"
                                : `Erinnerung ab ${formatSwissDate(booking.invoice.dueDate)} moeglich`
                            }
                            type="button"
                          >
                            <Bell size={15} />
                            Erinnerung senden
                          </button>

                          {!isInvoiceOverdue(booking.invoice) && (
                            <span className="admin-action-menu-note">
                              Moeglich ab {formatSwissDate(booking.invoice.dueDate)}
                            </span>
                          )}
                        </AdminInvoiceActionMenu>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!visibleBookings.length && <p className="admin-empty">Keine passenden Buchungen vorhanden.</p>}
        </div>
      </div>

      {selectedBooking && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Rechnung bearbeiten">
          <div className="admin-modal admin-invoice-modal">
            <button
              aria-label="Schliessen"
              className="admin-modal-close"
              onClick={() => setSelectedBooking(null)}
              type="button"
            >
              <X size={22} />
            </button>

            <InvoiceEditor
              key={selectedBooking.bookingId || selectedBooking.invoice?.id}
              onSaved={() => {
                setSelectedBooking(null);
                router.refresh();
              }}
              initialData={{
                basePrice: selectedBooking.basePrice,
                bookingId: selectedBooking.bookingId || null,
                invoiceId: selectedBooking.invoice?.id || null,
                clientEmail: selectedBooking.clientEmail,
                invoiceNumber:
                  selectedBooking.invoice?.invoiceNumber || `RE-${Math.floor(1000 + Math.random() * 9000)}`,
                items: selectedBooking.invoice?.items,
                language: selectedBooking.invoice?.language || "de",
                modifierPrice: selectedBooking.modifierPrice,
                serviceName: selectedBooking.serviceName,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}