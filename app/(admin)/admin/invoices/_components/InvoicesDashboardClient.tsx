"use client";

import { useState } from "react";
import InvoiceEditor from "./InvoiceEditor"; // This is the form component built previously

export default function InvoicesDashboardClient({ bookings }: { bookings: any[] }) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      
      {/* LEFT: Bookings list picker grid column */}
      <div className="xl:col-span-2 admin-panel bg-[#0d0e10] p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Wähle eine Buchung zum Bearbeiten</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                <th className="py-3 px-2">Kunde</th>
                <th className="py-3 px-2">Service</th>
                <th className="py-3 px-2">Datum</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => (
                <tr key={b.bookingId} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-medium text-white">{b.clientName}</td>
                  <td className="py-3 px-2">{b.serviceName}</td>
                  <td className="py-3 px-2 text-xs font-mono">
                    {new Date(b.dateTime).toLocaleDateString("de-CH")}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      b.invoice ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {b.invoice ? `Erstellt (${b.invoice.invoiceNumber})` : "Keine Rechnung"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded transition font-medium"
                    >
                      {b.invoice ? "Bearbeiten" : "Erstellen"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Dynamic Workspace Context (Changes based on selection) */}
      <div className="xl:col-span-1">
        {selectedBooking ? (
          <InvoiceEditor 
            key={selectedBooking.bookingId} // Reset state gracefully when switching bookings
            initialData={{
              bookingId: selectedBooking.bookingId,
              invoiceNumber: selectedBooking.invoice?.invoiceNumber || `RE-${Math.floor(1000 + Math.random() * 9000)}`,
              clientEmail: selectedBooking.clientEmail,
              serviceName: selectedBooking.serviceName,
              basePrice: selectedBooking.basePrice,
              modifierPrice: selectedBooking.modifierPrice,
              // Check if items already exist in database, otherwise fallback to default prefill layout array
              items: selectedBooking.invoice?.items
            }} 
          />
        ) : (
          <div className="border border-dashed border-white/10 rounded-lg p-12 text-center text-gray-500 text-sm bg-[#0d0e10]/40">
            Wähle links eine Buchung aus, um eine Rechnung zu bearbeiten oder neu zu generieren.
          </div>
        )}
      </div>

    </div>
  );
}