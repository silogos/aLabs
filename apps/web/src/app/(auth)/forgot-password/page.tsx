"use client";

import { authService } from "@/services/auth";
import { useState, type FormEvent } from "react";
import { BrandPanel } from "@/components/auth/BrandPanel";
import { Alert, EmailInput, Field, LegalFoot, Link } from "@/components/auth/form";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resetPath, setResetPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await authService.forgotPassword(email);
      setSentTo(email);
      setResetPath(res.resetPath ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!sentTo) return;
    setBusy(true);
    try {
      const res = await authService.forgotPassword(sentTo);
      setResetPath(res.resetPath ?? null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <BrandPanel />
      <main className="form-panel">
        <div className="form-card">
          {sentTo ? (
            <div className="sent-card" style={{ margin: "auto 0" }}>
              <div className="sent-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>
              <h1>Check your email</h1>
              <div className="email-chip">{sentTo}</div>
              <p className="sub">
                If an account exists for this address, a password reset link is on its way. The link
                expires in 1 hour.
              </p>

              {resetPath && (
                <div style={{ marginTop: 16, textAlign: "left" }}>
                  <Alert kind="info">
                    No email provider is wired up yet, so the reset link is shown here (and logged
                    server-side):{" "}
                    <Link href={resetPath} prefetch={false}>
                      Open reset page
                    </Link>
                  </Alert>
                </div>
              )}

              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="btn full" type="button" onClick={resend} disabled={busy}>
                  <span className="lbl-txt">Resend email</span>
                </button>
                <Link className="btn full" href="/login">
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="card-head">
                <div className="logo-sm">A</div>
                <h1>Forgot your password?</h1>
                <p className="sub">
                  Enter the email you sign in with and we&apos;ll send a reset link.
                </p>
              </div>

              {error && (
                <div style={{ marginBottom: 14 }}>
                  <Alert kind="danger">{error}</Alert>
                </div>
              )}

              <form className="form" onSubmit={submit} noValidate>
                <Field label="Work email" htmlFor="email">
                  <EmailInput id="email" value={email} onChange={setEmail} />
                </Field>

                <button
                  className={`btn primary full lg ${busy ? "loading" : ""}`}
                  type="submit"
                  disabled={busy}
                >
                  <span className="spinner"></span>
                  <span className="lbl-txt">Send reset link</span>
                </button>
              </form>

              <p className="switch-foot" style={{ marginTop: 18 }}>
                <Link href="/login">Back to sign in</Link>
              </p>
            </>
          )}
          <LegalFoot />
        </div>
      </main>
    </div>
  );
}
