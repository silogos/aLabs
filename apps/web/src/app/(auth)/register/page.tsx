"use client";

import { authService } from "@/services/auth";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandPanel } from "@/features/auth/brand-panel";
import {
  Alert,
  Divider,
  EmailInput,
  Field,
  GoogleButton,
  LegalFoot,
  Link,
  PasswordInput,
  StrengthMeter,
  SwitchFoot,
  TextInput,
} from "@/features/auth/auth-form";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!terms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authService.register({ name, email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account");
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <BrandPanel />
      <main className="form-panel">
        <div className="form-card">
          <div className="card-head">
            <div className="logo-sm">A</div>
            <h1>Create your account</h1>
            <p className="sub">
              Start your aLabs workspace in minutes — free while in development.
            </p>
          </div>

          <div className="oauth" style={{ marginBottom: 6 }}>
            <GoogleButton label="Sign up with Google" />
          </div>

          <Divider label="or sign up with email" />

          {error && (
            <div style={{ marginTop: 14 }}>
              <Alert kind="danger">{error}</Alert>
            </div>
          )}

          <form className="form" style={{ marginTop: 14 }} onSubmit={submit} noValidate>
            <Field label="Full name" htmlFor="name">
              <TextInput
                id="name"
                placeholder="Ada Lovelace"
                autoComplete="name"
                value={name}
                onChange={setName}
              />
            </Field>

            <Field label="Work email" htmlFor="email">
              <EmailInput id="email" autoComplete="username" value={email} onChange={setEmail} />
            </Field>

            <Field label="Password" htmlFor="password">
              <PasswordInput
                id="password"
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
              />
            </Field>

            <StrengthMeter value={password} />

            <label className="check-row">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>

            <button
              className={`btn primary full lg ${busy ? "loading" : ""}`}
              type="submit"
              disabled={busy}
            >
              <span className="spinner"></span>
              <span className="lbl-txt">Create account</span>
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

          <SwitchFoot text="Already have an account?" link={<Link href="/login">Sign in</Link>} />

          <LegalFoot />
        </div>
      </main>
    </div>
  );
}
