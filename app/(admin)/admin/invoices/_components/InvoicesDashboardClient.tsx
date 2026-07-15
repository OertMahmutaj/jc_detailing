"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import InvoiceEditor from "./InvoiceEditor";
import { AdminInvoiceActionMenu } from "../../_components/AdminInvoiceActionMenu";
import { useAdminNotification } from "../../_components/AdminNotificationProvider";

type InvoiceBooking = {
  basePrice: number;
  bookingId?: string | null;
  businessAddress?: string | null;
  clientAddress?: string | null;
  clientEmail: string;
  clientName: string;
  dateTime?: Date | string | null;
  draftItems: Array<{
    description: string;
    pricePerUnit: number;
    quantity: number;
    unit: string;
  }>;
  invoice?: {
    businessAddress?: string | null;
    clientAddress?: string | null;
    dueDate: Date | string;
    id: string;
    invoiceNumber: string;
    issuedAt?: Date | string | null;
    items?: any[];
    paidAt?: Date | string | null;
    pdfUrl?: string | null;
    reminderSentAt?: Date | string | null;
    sentAt?: Date | string | null;
    language?: string | null;
    promoCode?: string | null;
    promoDiscountAmount?: number;
    promoDiscountPercent?: number | null;
    recipientName?: string | null;
    serviceDate?: Date | string | null;
    status: "SENT" | "PAID";
    totalAmount: number;
    vatRate?: number;
  } | null;
  modifierPrice: number;
  promoCode?: string | null;
  promoDiscountAmount: number;
  promoDiscountPercent?: number | null;
  serviceName: string;
  suggestedInvoiceNumber: string;
  totalAmount: number;
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
  return (
    booking.bookingId ||
    booking.invoice?.id ||
    `${booking.clientEmail}-${booking.invoice?.invoiceNumber}`
  );
}

export default function InvoicesDashboardClient({
  bookings,
  metrics,
}: {
  bookings: InvoiceBooking[];
  metrics: InvoiceMetrics;
}) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const [selectedBooking, setSelectedBooking] =
    useState<InvoiceBooking | null>(null);

  const [isWorking, setIsWorking] = useState<string | null>(null);

  async function runInvoiceAction(
    endpoint: string,
    invoiceId: string,
    body?: Record<string, string>,
  ) {
    try {
      setIsWorking(invoiceId);

      const response = await fetch(endpoint, {
        body: JSON.stringify({
          invoiceId,
          ...body,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showNotification(
          data?.error || "Aktion konnte nicht ausgeführt werden.",
          "error",
        );
        return;
      }

      showNotification(
        data?.message || "Aktion wurde erfolgreich ausgeführt.",
        "success",
      );

      router.refresh();
    } catch (error) {
      console.error("Invoice action failed:", error);

      showNotification("Aktion konnte nicht ausgeführt werden.", "error");
    } finally {
      setIsWorking(null);
    }
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
          <span>Überfällige Zahlungen</span>
          <strong>{formatCurrency(metrics.overduePayments)}</strong>
          <small>Offen nach Fälligkeitsdatum</small>
        </article>
      </section>

      <div className="admin-panel admin-invoice-bookings">
        <div className="admin-panel-head">
          <h2>Wähle eine Buchung zum Bearbeiten</h2>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table admin-invoices-table">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Service</th>
                <th>Datum</th>
                <th>Status</th>
                <th>Betrag</th>
                <th>Aktion</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={getRowKey(booking)}>
                  <td data-label="Kunde">
                    <strong>{booking.clientName}</strong>
                    <span>{booking.clientEmail}</span>
                  </td>

                  <td data-label="Service">{booking.serviceName}</td>

                  <td data-label="Datum">{formatSwissDate(booking.dateTime)}</td>

                  <td data-label="Status">
                    <span
                      className={`admin-status-pill is-${
                        booking.invoice?.status?.toLowerCase() || "missing"
                      }`}
                    >
                      {booking.invoice
                        ? statusLabels[booking.invoice.status]
                        : "Keine Rechnung"}
                    </span>

                    {booking.invoice && (
                      <span>{booking.invoice.invoiceNumber}</span>
                    )}
                  </td>

                  <td data-label="Betrag">
                    <strong>{formatCurrency(booking.totalAmount)}</strong>
                  </td>

                  <td data-label="Aktion">
                    <div className="admin-row-actions">
                      <button
                        className="admin-action-button"
                        onClick={() => setSelectedBooking(booking)}
                        type="button"
                      >
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
                              runInvoiceAction(
                                "/api/admin/invoices/status",
                                booking.invoice!.id,
                                {
                                  status: "PAID",
                                },
                              )
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
                                booking.invoice!.id,
                              )
                            }
                            title={
                              isInvoiceOverdue(booking.invoice)
                                ? "Erinnerung senden"
                                : `Erinnerung ab ${formatSwissDate(
                                    booking.invoice.dueDate,
                                  )} möglich`
                            }
                            type="button"
                          >
                            <Bell size={15} />
                            Erinnerung senden
                          </button>

                          {!isInvoiceOverdue(booking.invoice) && (
                            <span className="admin-action-menu-note">
                              Möglich ab{" "}
                              {formatSwissDate(booking.invoice.dueDate)}
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

          {!bookings.length && (
            <p className="admin-empty">Keine passenden Buchungen vorhanden.</p>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Rechnung bearbeiten"
        >
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
                businessAddress:
                  selectedBooking.invoice?.businessAddress ||
                  selectedBooking.businessAddress,
                clientAddress:
                  selectedBooking.invoice?.clientAddress ||
                  selectedBooking.clientAddress,
                invoiceId: selectedBooking.invoice?.id || null,
                clientEmail: selectedBooking.clientEmail,
                clientName:
                  selectedBooking.invoice?.recipientName ||
                  selectedBooking.clientName,
                invoiceNumber:
                  selectedBooking.invoice?.invoiceNumber ||
                  selectedBooking.suggestedInvoiceNumber,
                issuedAt: selectedBooking.invoice?.issuedAt,
                items:
                  selectedBooking.invoice?.items || selectedBooking.draftItems,
                language: selectedBooking.invoice?.language || "de",
                modifierPrice: selectedBooking.modifierPrice,
                promoCode:
                  selectedBooking.invoice?.promoCode ||
                  selectedBooking.promoCode,
                promoDiscountPercent:
                  selectedBooking.invoice?.promoDiscountPercent ??
                  selectedBooking.promoDiscountPercent,
                serviceDate:
                  selectedBooking.invoice?.serviceDate ||
                  selectedBooking.dateTime,
                serviceName: selectedBooking.serviceName,
                vatRate: selectedBooking.invoice?.vatRate ?? 0,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
