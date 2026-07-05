"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data?.error || "Login fehlgeschlagen.");
      return;
    }

    router.replace(searchParams.get("next") || "/admin/dashboard");
    router.refresh();
  }

  return (
    <form className="admin-login-card" onSubmit={onSubmit}>
      <div>
        <p>JC Detailing</p>
        <h1>Admin Login</h1>
      </div>

      <label>
        E-Mail
        <input autoComplete="email" name="email" required type="email" />
      </label>

      <label>
        Passwort
        <input autoComplete="current-password" name="password" required type="password" />
      </label>

      {error && <span className="admin-login-error">{error}</span>}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Einloggen..." : "Einloggen"}
      </button>
    </form>
  );
}
