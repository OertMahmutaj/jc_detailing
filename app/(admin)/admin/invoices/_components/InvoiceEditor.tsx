"use client";

import { useState } from "react";
import { Plus, Trash2, Mail } from "lucide-react";

interface Item {
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

interface InvoiceEditorProps {
  initialData: {
    bookingId: string;
    invoiceNumber: string;
    clientEmail: string;
    serviceName: string;
    basePrice: number;
    modifierPrice: number;
    items?: any[];
  };
}

export default function InvoiceEditor({ initialData }: InvoiceEditorProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(initialData.invoiceNumber);
  const [targetEmail, setTargetEmail] = useState(initialData.clientEmail);
  const [vatRate, setVatRate] = useState(7.7);
  
  // Initialize items from existing database items, otherwise fall back to prefilled default booking info
  const [items, setItems] = useState<Item[]>(
    initialData.items && initialData.items.length > 0
      ? initialData.items.map((i: any) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          pricePerUnit: i.pricePerUnit,
        }))
      : [
          {
            description: initialData.serviceName,
            quantity: 1,
            unit: "Stk.",
            pricePerUnit: initialData.basePrice + initialData.modifierPrice,
          },
        ]
  );
  
  const [isSending, setIsSending] = useState(false);

  // Totals calculations
  const netAmount = items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
  const vatAmount = netAmount * (vatRate / 100);
  const totalAmount = netAmount + vatAmount;

  const addItem = () => {
    setItems([...items, { description: "Zusatzleistung", quantity: 1, unit: "Stk.", pricePerUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Item, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSendInvoice = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/invoices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: initialData.bookingId,
          invoiceNumber,
          targetEmail,
          vatRate,
          items,
          totalAmount,
        }),
      });
      
      if (res.ok) {
        alert("Rechnung erfolgreich gebucht und per E-Mail gesendet!");
      } else {
        const errData = await res.json();
        alert(`Fehler: ${errData.error || "Unbekannter Fehler"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Netzwerkfehler beim Senden der Rechnung.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-panel p-6 bg-[#0d0e10] text-white rounded-lg border border-white/10">
      <h2 className="text-xl font-bold mb-6">Rechnung bearbeiten</h2>

      {/* Meta configuration grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rechnungsnummer</label>
          <input 
            className="w-full bg-[#16171a] border border-white/10 p-2 rounded text-white text-sm focus:outline-none focus:border-orange-500" 
            value={invoiceNumber} 
            onChange={(e) => setInvoiceNumber(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Empfänger-E-Mail (Kann geändert werden)</label>
          <input 
            className="w-full bg-[#16171a] border border-white/10 p-2 rounded text-white text-sm focus:outline-none focus:border-orange-500" 
            type="email" 
            value={targetEmail} 
            onChange={(e) => setTargetEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mehrwertsteuer (MwSt. %)</label>
          <input 
            className="w-full bg-[#16171a] border border-white/10 p-2 rounded text-white text-sm focus:outline-none focus:border-orange-500" 
            type="number" 
            step="0.1" 
            value={vatRate} 
            onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)} 
          />
        </div>
      </div>

      {/* Items List Builder */}
      <div className="space-y-3 mb-6">
        <label className="block text-xs text-gray-400">Positionen</label>
        {items.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-[#16171a] p-3 rounded border border-white/5">
            <input 
              className="flex-1 bg-transparent border-b border-white/10 p-1 text-sm text-white focus:outline-none focus:border-orange-500 w-full" 
              placeholder="Beschreibung" 
              value={item.description} 
              onChange={(e) => updateItem(index, "description", e.target.value)} 
            />
            <div className="flex gap-2 w-full sm:w-auto justify-between items-center mt-2 sm:mt-0">
              <input 
                className="w-14 bg-transparent border-b border-white/10 p-1 text-center text-sm focus:outline-none" 
                type="number" 
                placeholder="Menge" 
                value={item.quantity} 
                onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)} 
              />
              <input 
                className="w-14 bg-transparent border-b border-white/10 p-1 text-center text-sm focus:outline-none" 
                placeholder="Einheit" 
                value={item.unit} 
                onChange={(e) => updateItem(index, "unit", e.target.value)} 
              />
              <input 
                className="w-24 bg-transparent border-b border-white/10 p-1 text-right text-sm focus:outline-none" 
                type="number" 
                placeholder="Preis" 
                value={item.pricePerUnit} 
                onChange={(e) => updateItem(index, "pricePerUnit", parseFloat(e.target.value) || 0)} 
              />
              <button 
                onClick={() => removeItem(index)} 
                className="text-red-400 hover:text-red-500 p-1"
                disabled={items.length === 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        <button 
          onClick={addItem} 
          className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-500 mt-2 transition"
        >
          <Plus size={14} /> Position hinzufügen
        </button>
      </div>

      {/* Calculations Summary Section */}
      <div className="border-t border-white/10 pt-4 flex flex-col items-end gap-1 text-sm text-gray-300">
        <div>Netto: <span className="font-mono font-bold text-white">CHF {netAmount.toFixed(2)}</span></div>
        <div>MwSt. {vatRate}%: <span className="font-mono font-bold text-white">CHF {vatAmount.toFixed(2)}</span></div>
        <div className="text-base text-orange-400 font-bold border-t border-white/10 pt-2 mt-1">
          Gesamt: <span className="font-mono text-white">CHF {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={handleSendInvoice} 
        disabled={isSending} 
        className="mt-6 w-full bg-orange-500 hover:bg-orange-600 font-medium py-2.5 rounded flex justify-center items-center gap-2 transition disabled:opacity-50 text-sm text-white"
      >
        <Mail size={16} /> {isSending ? "Wird verarbeitet..." : "Buchen & per E-Mail senden"}
      </button>
    </div>
  );
}