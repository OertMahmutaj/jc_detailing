"use client";

import Image from "next/image";
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, UserPlus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [resetNeedsNewLink, setResetNeedsNewLink] = useState(false);
  const [resetRequestEmail, setResetRequestEmail] = useState("");
  const resetToken = searchParams.get("reset");

  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((current) => (current === null ? null : Math.max(0, current - 1)));
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  useEffect(() => {
    if (resetToken) {
      setResetOpen(true);
      setModalError("");
      setModalMessage("");
      setResetNeedsNewLink(false);

      fetch(`/api/admin/password-reset/validate?token=${encodeURIComponent(resetToken)}`)
        .then(async (response) => {
          const data = await response.json().catch(() => null);

          if (!response.ok) {
            setResetNeedsNewLink(true);
            setResetRequestEmail(String(data?.email ?? ""));
            setModalError(data?.error || "Dieser Reset-Link ist nicht mehr gueltig.");
          }
        })
        .catch(() => {
          setResetNeedsNewLink(true);
          setModalError("Reset-Link konnte nicht geprueft werden. Bitte fordere einen neuen Link an.");
        });
    }
  }, [resetToken]);

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

  function openModal(type: "register" | "forgot") {
    setModalError("");
    setModalMessage("");
    setShowRegisterPassword(false);
    setShowResetPassword(false);
    setResetNeedsNewLink(false);
    setRegisterOpen(type === "register");
    setForgotOpen(type === "forgot");
  }

  async function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");
    setModalMessage("");
    setModalSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setModalSubmitting(false);
      setModalError("Die Passwoerter stimmen nicht ueberein.");
      return;
    }

    const response = await fetch("/api/admin/register", {
      body: JSON.stringify({
        code: form.get("code"),
        email: form.get("email"),
        name: form.get("name"),
        confirmPassword,
        password,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setModalSubmitting(false);

    if (!response.ok) {
      setModalError(data?.error || "Registrierung fehlgeschlagen.");
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  async function sendPasswordResetRequest(email: FormDataEntryValue | null) {
    const response = await fetch("/api/admin/password-reset/request", {
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setModalSubmitting(false);

    if (!response.ok) {
      setModalError(data?.error || "Reset-Link konnte nicht gesendet werden.");
      return;
    }

    setModalMessage("Wenn diese E-Mail registriert ist, wurde ein Reset-Link gesendet.");
  }

  async function onForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");
    setModalMessage("");
    setModalSubmitting(true);

    const form = new FormData(event.currentTarget);
    await sendPasswordResetRequest(form.get("email"));
  }

  async function onExpiredResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");
    setModalMessage("");
    setModalSubmitting(true);

    const form = new FormData(event.currentTarget);
    await sendPasswordResetRequest(form.get("email"));
  }

  async function onResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");
    setModalMessage("");
    setModalSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setModalSubmitting(false);
      setModalError("Die Passwoerter stimmen nicht ueberein.");
      return;
    }

    const response = await fetch("/api/admin/password-reset/confirm", {
      body: JSON.stringify({
        confirmPassword,
        password,
        token: resetToken,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setModalSubmitting(false);

    if (!response.ok) {
      setModalError(data?.error || "Passwort konnte nicht geaendert werden.");
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  const isLocked = retryAfter !== null && retryAfter > 0;

  return (
    <>
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

        <div className="admin-login-secondary-actions">
          <button onClick={() => openModal("register")} type="button">
            <UserPlus size={16} />
            Registrieren
          </button>
          <button onClick={() => openModal("forgot")} type="button">
            <KeyRound size={16} />
            Passwort vergessen
          </button>
        </div>
      </form>

      {registerOpen && (
        <div className="admin-auth-modal-backdrop" role="dialog" aria-modal="true">
          <form className="admin-auth-modal" onSubmit={onRegister}>
            <button
              aria-label="Schliessen"
              className="admin-auth-modal-close"
              onClick={() => setRegisterOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
            <span className="admin-auth-kicker">Admin Zugang</span>
            <h2>Admin registrieren</h2>
            <label>
              <span>Registrierungscode</span>
              <input autoComplete="one-time-code" name="code" required />
            </label>
            <label>
              <span>Name</span>
              <input autoComplete="name" name="name" />
            </label>
            <label>
              <span>E-Mail</span>
              <input autoComplete="email" name="email" required type="email" />
            </label>
            <label>
              <span>Passwort</span>
              <span className="admin-login-input-wrap">
                <LockKeyhole aria-hidden="true" size={17} />
                <input
                  autoComplete="new-password"
                  minLength={8}
                  name="password"
                  required
                  type={showRegisterPassword ? "text" : "password"}
                />
                <button
                  aria-label={showRegisterPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
                  className="admin-login-password-toggle"
                  onClick={() => setShowRegisterPassword((current) => !current)}
                  type="button"
                >
                  {showRegisterPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <label>
              <span>Passwort bestaetigen</span>
              <span className="admin-login-input-wrap">
                <LockKeyhole aria-hidden="true" size={17} />
                <input
                  autoComplete="new-password"
                  minLength={8}
                  name="confirmPassword"
                  required
                  type={showRegisterPassword ? "text" : "password"}
                />
                <button
                  aria-label={showRegisterPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
                  className="admin-login-password-toggle"
                  onClick={() => setShowRegisterPassword((current) => !current)}
                  type="button"
                >
                  {showRegisterPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            {modalError && <p className="admin-login-error">{modalError}</p>}
            <button className="admin-login-submit" disabled={modalSubmitting} type="submit">
              {modalSubmitting ? "Wird erstellt..." : "Registrieren"}
            </button>
          </form>
        </div>
      )}

      {forgotOpen && (
        <div className="admin-auth-modal-backdrop" role="dialog" aria-modal="true">
          <form className="admin-auth-modal" onSubmit={onForgotPassword}>
            <button
              aria-label="Schliessen"
              className="admin-auth-modal-close"
              onClick={() => setForgotOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
            <span className="admin-auth-kicker">Passwort</span>
            <h2>Reset-Link senden</h2>
            <label>
              <span>E-Mail</span>
              <input autoComplete="email" name="email" required type="email" />
            </label>
            {modalError && <p className="admin-login-error">{modalError}</p>}
            {modalMessage && <p className="admin-login-success">{modalMessage}</p>}
            <button className="admin-login-submit" disabled={modalSubmitting} type="submit">
              {modalSubmitting ? "Wird gesendet..." : "Reset-Link senden"}
            </button>
          </form>
        </div>
      )}

      {resetOpen && (
        <div className="admin-auth-modal-backdrop" role="dialog" aria-modal="true">
          <form
            className="admin-auth-modal"
            onSubmit={resetNeedsNewLink ? onExpiredResetRequest : onResetPassword}
          >
            <button
              aria-label="Schliessen"
              className="admin-auth-modal-close"
              onClick={() => setResetOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
            <span className="admin-auth-kicker">Neues Passwort</span>
            <h2>Passwort setzen</h2>
            {resetNeedsNewLink ? (
              <>
                <p className="admin-auth-help">
                  Der Link kann nicht mehr verwendet werden. Gib deine E-Mail ein und fordere einen neuen Link an.
                </p>
                <label>
                  <span>E-Mail</span>
                  <input
                    autoComplete="email"
                    defaultValue={resetRequestEmail}
                    name="email"
                    required
                    type="email"
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  <span>Neues Passwort</span>
                  <span className="admin-login-input-wrap">
                    <LockKeyhole aria-hidden="true" size={17} />
                    <input
                      autoComplete="new-password"
                      minLength={8}
                      name="password"
                      required
                      type={showResetPassword ? "text" : "password"}
                    />
                    <button
                      aria-label={showResetPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
                      className="admin-login-password-toggle"
                      onClick={() => setShowResetPassword((current) => !current)}
                      type="button"
                    >
                      {showResetPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
                <label>
                  <span>Neues Passwort bestaetigen</span>
                  <span className="admin-login-input-wrap">
                    <LockKeyhole aria-hidden="true" size={17} />
                    <input
                      autoComplete="new-password"
                      minLength={8}
                      name="confirmPassword"
                      required
                      type={showResetPassword ? "text" : "password"}
                    />
                    <button
                      aria-label={showResetPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
                      className="admin-login-password-toggle"
                      onClick={() => setShowResetPassword((current) => !current)}
                      type="button"
                    >
                      {showResetPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
              </>
            )}
            {modalError && <p className="admin-login-error">{modalError}</p>}
            {modalMessage && <p className="admin-login-success">{modalMessage}</p>}
            <button className="admin-login-submit" disabled={modalSubmitting} type="submit">
              {resetNeedsNewLink
                ? modalSubmitting
                  ? "Wird gesendet..."
                  : "Neuen Link senden"
                : modalSubmitting
                  ? "Wird gespeichert..."
                  : "Passwort speichern"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
