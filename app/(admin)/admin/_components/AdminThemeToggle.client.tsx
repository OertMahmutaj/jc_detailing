"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-theme");
      const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = saved || (prefersDark ? "dark" : "light");
      setTheme(initial);
    } catch (e) {
      // noop
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("admin-theme", next);
      if (next === "dark") {
        document.documentElement.setAttribute("data-admin-theme", "dark");
        document.body.classList.add("admin-theme-dark");
      } else {
        document.documentElement.removeAttribute("data-admin-theme");
        document.body.classList.remove("admin-theme-dark");
      }
    } catch (e) {
      // noop
    }

    setTheme(next);
  }

  return (
    <button
      aria-pressed={theme === "dark"}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="admin-theme-toggle"
      onClick={toggle}
      type="button"
    >
      <span className="admin-theme-toggle-icon">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</span>
      <span className="admin-theme-toggle-label">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
