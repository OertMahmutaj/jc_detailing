import { prisma } from "../_lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-CH", {
    currency: "CHF",
    style: "currency",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
  }).format(value);
}

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      booking: {
        include: {
          client: true,
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p>Rechnungen</p>
        <h1>Invoices</h1>
      </header>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Rechnungen</h2>
          <span>Erstellung und E-Mail-Versand kommen als nächster Schritt.</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nummer</th>
                <th>Kunde</th>
                <th>Datum</th>
                <th>Fällig</th>
                <th>Betrag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.invoiceNumber}</strong>
                  </td>
                  <td>
                    <strong>{invoice.booking.client.name}</strong>
                    <span>{invoice.booking.client.email}</span>
                  </td>
                  <td>{formatDate(invoice.issuedAt)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td>{formatCurrency(invoice.totalAmount)}</td>
                  <td>{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!invoices.length && <p className="admin-empty">Noch keine Rechnungen vorhanden.</p>}
        </div>
      </section>
    </div>
  );
}
