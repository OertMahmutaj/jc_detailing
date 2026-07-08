"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type InvoiceStatusFilter = "all" | "missing" | "sent" | "paid" | "overdue";

type InvoiceSort =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc";

type InvoiceFiltersProps = {
  query: string;
  sort: InvoiceSort;
  status: InvoiceStatusFilter;
};

export function InvoiceFilters({
  query,
  sort,
  status,
}: InvoiceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(query);
  const [, startTransition] = useTransition();

  function updateUrl(nextValues: {
    q?: string;
    sort?: InvoiceSort;
    status?: InvoiceStatusFilter;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");

    if ("q" in nextValues) {
      const nextQuery = nextValues.q?.trim() ?? "";

      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }
    }

    if ("status" in nextValues) {
      const nextStatus = nextValues.status ?? "all";

      if (nextStatus === "all") {
        params.delete("status");
      } else {
        params.set("status", nextStatus);
      }
    }

    if ("sort" in nextValues) {
      const nextSort = nextValues.sort ?? "date-desc";

      if (nextSort === "date-desc") {
        params.delete("sort");
      } else {
        params.set("sort", nextSort);
      }
    }

    const queryString = params.toString();
    const nextHref = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(nextHref, {
        scroll: false,
      });
    });
  }

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchValue !== query) {
        updateUrl({
          q: searchValue,
        });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchValue, query]);

  return (
    <div className="admin-filter-form">
      <input
        aria-label="Rechnungen suchen"
        placeholder="Kunde, E-Mail, Rechnung..."
        type="search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      />

      <select
        aria-label="Rechnungsstatus filtern"
        value={status}
        onChange={(event) =>
          updateUrl({
            status: event.target.value as InvoiceStatusFilter,
          })
        }
      >
        <option value="all">Alle Status</option>
        <option value="missing">Keine Rechnung</option>
        <option value="sent">Gesendet</option>
        <option value="paid">Bezahlt</option>
        <option value="overdue">Überfällig</option>
      </select>

      <select
        aria-label="Rechnungen sortieren"
        value={sort}
        onChange={(event) =>
          updateUrl({
            sort: event.target.value as InvoiceSort,
          })
        }
      >
        <option value="date-desc">Datum: Neueste zuerst</option>
        <option value="date-asc">Datum: Älteste zuerst</option>
        <option value="amount-desc">Betrag: Höchster zuerst</option>
        <option value="amount-asc">Betrag: Niedrigster zuerst</option>
      </select>
    </div>
  );
}