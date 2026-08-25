"use client";

import { authService } from "@/services/auth";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandPanel } from "@/components/auth/BrandPanel";
import {
  Alert,
  Field,
  LegalFoot,
  Link,
  PasswordInput,
  StrengthMeter,
} from "@/components/auth/form";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authService.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="form-panel">
      <div className="form-card">
        {done ? (
          <div className="sent-card" style={{ margin: "auto 0" }}>
            <div className="sent-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h1>Password reset</h1>
            <p className="sub">
              Your password has been updated and all previous sessions were signed out.
            </p>
            <button
              className="btn primary full lg"
              style={{ marginTop: 18 }}
              onClick={() => router.replace("/login")}
            >
              Continue to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="card-head">
              <div className="logo-sm">A</div>
              <h1>Set a new password</h1>
              <p className="sub">
                Choose a strong password you haven&apos;t used before. All active sessions will be
                signed out.
              </p>
            </div>

            {!token && (
              <div style={{ marginBottom: 14 }}>
                <Alert kind="danger">
                  This link is missing its token — request a new one from the{" "}
                  <Link href="/forgot-password">forgot password</Link> page.
                </Alert>
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 14 }}>
                <Alert kind="danger">{error}</Alert>
              </div>
            )}

            <form className="form" onSubmit={submit} noValidate>
              <Field label="New password" htmlFor="password">
                <PasswordInput
                  id="password"
                  placeholder="New password"
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                />
              </Field>

              <StrengthMeter value={password} />

              <Field label="Confirm password" htmlFor="confirm">
                <PasswordInput
                  id="confirm"
                  placeholder="Repeat the new password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={setConfirm}
                />
              </Field>

              <button
                className={`btn primary full lg ${busy ? "loading" : ""}`}
                type="submit"
                disabled={busy || !token}
              >
                <span className="spinner"></span>
                <span className="lbl-txt">Reset password</span>
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth">
      <BrandPanel />
      <Suspense fallback={<main className="form-panel" />}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
