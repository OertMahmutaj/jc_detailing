"use client";

import { useEffect } from "react";

export default function AdminRowCollapse() {
  useEffect(() => {
    function ensureToggle(row: Element) {
      if (row.querySelector(".admin-row-collapse-toggle")) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "admin-row-collapse-toggle";
      btn.setAttribute("aria-expanded", "true");
      btn.innerText = "Details";

      btn.addEventListener("click", () => {
        const is = row.classList.toggle("is-collapsed");
        btn.setAttribute("aria-expanded", String(!is));
      });

      row.appendChild(btn);
    }

    function process() {
      // Only activate collapse behavior on bookings and clients pages
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      if (!path.startsWith("/admin/bookings") && !path.startsWith("/admin/clients")) return;

      // handle block list rows (existing lists)
      const listRows = Array.from(document.querySelectorAll(".admin-list-row"));
      listRows.forEach((r) => ensureToggle(r));

      // handle table rows for bookings and clients
      let tableSelector = null;
      if (path.startsWith("/admin/bookings")) tableSelector = ".admin-bookings-table tbody tr";
      if (path.startsWith("/admin/clients")) tableSelector = ".admin-table tbody tr";

      const tableRows = tableSelector ? Array.from(document.querySelectorAll(tableSelector)) : [];
      const cardLayout = window.matchMedia("(max-width: 1100px)").matches;

      tableRows.forEach((row) => {
        if (cardLayout && path.startsWith("/admin/bookings")) {
          row.classList.remove("is-collapsed");
          row.querySelector(".admin-row-collapse-toggle")?.remove();
          return;
        }

        // ensure toggle exists in last cell
        if (!row.querySelector('.admin-row-collapse-toggle')) {
          const lastCell = row.querySelector('td:last-child');
          if (lastCell) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'admin-row-collapse-toggle';
            btn.setAttribute('aria-expanded', 'true');
            btn.innerText = 'Details';
            btn.addEventListener('click', () => {
              const is = row.classList.toggle('is-collapsed');
              btn.setAttribute('aria-expanded', String(!is));
            });
            // mark cell so it won't be hidden when collapsed
            lastCell.classList.add('admin-row-collapse-cell');
            lastCell.appendChild(btn);
          }
        }
      });

      // On small screens collapse rows by default for compactness
      const mq = window.matchMedia("(max-width: 760px)");
      const cardMq = window.matchMedia("(max-width: 1100px)");

      const applyCollapse = (r: Element) => {
        if (cardMq.matches && path.startsWith("/admin/bookings")) {
          r.classList.remove("is-collapsed");
          const btn = r.querySelector(".admin-row-collapse-toggle");
          if (btn) btn.setAttribute("aria-expanded", "true");
          return;
        }

        if (mq.matches) {
          r.classList.add("is-collapsed");
          const btn = r.querySelector(".admin-row-collapse-toggle");
          if (btn) btn.setAttribute("aria-expanded", "false");
        } else {
          r.classList.remove("is-collapsed");
          const btn = r.querySelector(".admin-row-collapse-toggle");
          if (btn) btn.setAttribute("aria-expanded", "true");
        }
      };

      listRows.forEach(applyCollapse);
      tableRows.forEach(applyCollapse);
    }

    process();

    window.addEventListener("resize", process);
    // Also observe DOM changes in case rows are rendered later
    const obs = new MutationObserver(() => process());
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", process);
      obs.disconnect();
    };
  }, []);

  return null;
}
