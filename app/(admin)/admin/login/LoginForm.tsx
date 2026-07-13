"use client";

import Image from "next/image";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((current) => (current === null ? null : Math.max(0, current - 1)));
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

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

    if (response.status === 429) {
      setRetryAfter(data?.retryAfter ?? 60);
      setError(data?.error || "Zu viele Versuche. Bitte später erneut versuchen.");
      return;
    }

    if (!response.ok) {
      setError(data?.error || "Login fehlgeschlagen.");
      return;
    }

    router.replace(searchParams.get("next") || "/admin/dashboard");
    router.refresh();
  }

  const isLocked = retryAfter !== null && retryAfter > 0;

  return (
    <form className="admin-login-card" onSubmit={onSubmit}>
      <div className="admin-login-brand">
        <Image
          alt="JC Detailing"
          className="admin-login-logo"
          height={120}
          priority
          src="/logo.png"
          width={180}
        />
        <p>JC Detailing</p>
        <h1>Admin Login</h1>
      </div>

      <label>
        <span>E-Mail</span>
        <span className="admin-login-input-wrap">
          <Mail aria-hidden="true" size={17} />
          <input autoComplete="email" name="email" required type="email" />
        </span>
      </label>

      <label>
        <span>Passwort</span>
        <span className="admin-login-input-wrap">
          <LockKeyhole aria-hidden="true" size={17} />
          <input
            autoComplete="current-password"
            name="password"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
            className="admin-login-password-toggle"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
      </label>

      {error && (
        <span className="admin-login-error">
          {error}
          {isLocked && ` (${retryAfter}s)`}
        </span>
      )}

      <button
        className="admin-login-submit"
        disabled={isSubmitting || isLocked}
        type="submit"
      >
        {isLocked
          ? `Bitte warten (${retryAfter}s)`
          : isSubmitting
            ? "Einloggen..."
            : "Einloggen"}
      </button>
    </form>
  );
}
