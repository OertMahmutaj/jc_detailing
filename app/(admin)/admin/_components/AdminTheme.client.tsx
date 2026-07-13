"use client";

import { useEffect } from "react";

export default function AdminThemeInitializer() {
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("admin-theme") : null;
      const theme = saved || "dark";

      if (theme === "dark") {
        document.documentElement.setAttribute("data-admin-theme", "dark");
        document.body.classList.add("admin-theme-dark");
      } else {
        document.documentElement.setAttribute("data-admin-theme", "light");
        document.body.classList.remove("admin-theme-dark");
      }
    } catch (e) {
      // noop
    }
  }, []);

  return null;
}
