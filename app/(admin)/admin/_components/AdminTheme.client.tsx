"use client";

import { useEffect } from "react";

export default function AdminThemeInitializer() {
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("admin-theme") : null;
      let theme = saved || null;

      if (!theme && typeof window !== "undefined" && window.matchMedia) {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      if (theme === "dark") {
        document.documentElement.setAttribute("data-admin-theme", "dark");
        document.body.classList.add("admin-theme-dark");
      } else {
        document.documentElement.removeAttribute("data-admin-theme");
        document.body.classList.remove("admin-theme-dark");
      }
    } catch (e) {
      // noop
    }
  }, []);

  return null;
}
