"use client";

import { authService } from "@/services/auth";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandPanel } from "../_components/brand-panel";
import {
  Alert,
  Divider,
  EmailInput,
  Field,
  GoogleButton,
  LegalFoot,
  Link,
  PasswordInput,
  SwitchFoot,
} from "../_components/auth-form";

const AUTH_ERROR_TEXT: Record<string, string> = {
  google_not_configured:
    "Google sign-in is not configured on this server. Use email and password instead.",
  invalid_state: "The sign-in attempt expired or was tampered with. Please try again.",
  missing_code_or_state: "The sign-in attempt was incomplete. Please try again.",
  token_exchange_failed: "Google rejected the sign-in. Please try again.",
  userinfo_failed: "Could not reach Google to confirm your account. Please try again.",
  email_missing: "Your Google account has no email address exposed.",
};

const GENERIC_AUTH_ERROR = "Sign-in failed. Please try again.";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const authError = params.get("authError");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    authError ? (AUTH_ERROR_TEXT[authError] ?? GENERIC_AUTH_ERROR) : null,
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authService.login({ email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <main className="form-panel">
      <div className="form-card">
        <div className="card-head">
          <div className="logo-sm">A</div>
          <h1>Welcome back</h1>
          <p className="sub">Sign in to your aLabs workspace to continue.</p>
        </div>

        <div className="oauth" style={{ marginBottom: 6 }}>
          <GoogleButton label="Continue with Google" />
        </div>

        <Divider label="or sign in with email" />

        {error && (
          <div style={{ marginTop: 14 }}>
            <Alert kind="danger">{error}</Alert>
          </div>
        )}

        <form className="form" style={{ marginTop: 14 }} onSubmit={submit} noValidate>
          <Field label="Work email" htmlFor="email">
            <EmailInput id="email" autoComplete="username" value={email} onChange={setEmail} />
          </Field>

          <Field label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              placeholder="Enter password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
          </Field>

          <div className="between-row">
            <label className="check-row">
              <input type="checkbox" defaultChecked /> Keep me signed in
            </label>
            <Link className="link" href="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            className={`btn primary full lg ${busy ? "loading" : ""}`}
            type="submit"
            disabled={busy}
          >
            <span className="spinner"></span>
            <span className="lbl-txt">Sign in</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>

        <SwitchFoot text="Don't have an account?" link={<Link href="/register">Create one</Link>} />

        <LegalFoot />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="auth">
      <BrandPanel />
      <Suspense fallback={<main className="form-panel" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
