/** Shared auth form primitives — ported from designs/auth/ (markup) and
 *  designs/auth/auth.js (strength scoring, password toggle). */
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

/* ---- field + inputs ---- */

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function EmailInput({
  id,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="input-wrap">
      <svg className="lead" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
      <input
        className="input lead-pad"
        type="email"
        id={id}
        name={id}
        inputMode="email"
        autoComplete={autoComplete ?? "email"}
        placeholder="you@company.com"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function TextInput({
  id,
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="input"
      type="text"
      id={id}
      name={id}
      autoComplete={autoComplete}
      placeholder={placeholder}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function PasswordInput({
  id,
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrap">
      <svg className="lead" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      <input
        className="input lead-pad mono"
        type={show ? "text" : "password"}
        id={id}
        name={id}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        minLength={8}
        style={{ paddingRight: 42 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="input-affix">
        <button
          className="eye-btn"
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9.9 4.2A9.5 9.5 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-3 3.8M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 4-1M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---- google oauth button (server-side redirect flow) ---- */

export function GoogleButton({ label }: { label: string }) {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- full-page nav to a server OAuth route
    <a className="btn oauth-btn full" href="/api/auth/oauth/google">
      <span className="gi">
        <svg viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5 5 0 0 1-2.18 3.3v2.7h3.52c2.06-1.9 3.26-4.7 3.26-7.84z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.94 0 5.42-.98 7.23-2.64l-3.52-2.7c-.98.66-2.23 1.05-3.71 1.05-2.85 0-5.27-1.93-6.13-4.52H2.22v2.79A11 11 0 0 0 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.87 14.19a6.6 6.6 0 0 1 0-4.2V7.2H2.22a11 11 0 0 0 0 9.78l3.65-2.79z"
          />
          <path
            fill="#EA4335"
            d="M12 4.9c1.6 0 3.04.55 4.18 1.64l3.12-3.12A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.22 7.2l3.65 2.79C6.73 6.83 9.15 4.9 12 4.9z"
          />
        </svg>
      </span>
      {label}
    </a>
  );
}

/* ---- inline alert ---- */

const ALERT_ICONS = {
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v4h1" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  ok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  ),
};

export function Alert({ kind, children }: { kind: "info" | "danger" | "ok"; children: ReactNode }) {
  return (
    <div className={`alert ${kind}`}>
      <span className="ai">{ALERT_ICONS[kind]}</span>
      <div className="ab">{children}</div>
    </div>
  );
}

/* ---- password strength (scoring ported from designs/auth/auth.js) ---- */

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

export function pwChecks(v: string) {
  return {
    len: v.length >= 8,
    upper: /[a-z]/.test(v) && /[A-Z]/.test(v),
    num: /\d/.test(v),
    sym: /[^A-Za-z0-9]/.test(v),
  };
}

export function pwScore(v: string): number {
  if (!v) return 0;
  const c = pwChecks(v);
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (c.upper) score++;
  if (c.num) score++;
  if (c.sym) score++;
  if (score > 4) score = 4;
  else if (score < 1) score = 1;
  if (v.length > 0 && v.length < 8) score = 1;
  return score;
}

const REQS: { key: keyof ReturnType<typeof pwChecks>; label: string }[] = [
  { key: "len", label: "8+ characters" },
  { key: "upper", label: "Upper & lowercase" },
  { key: "num", label: "A number" },
  { key: "sym", label: "A symbol" },
];

export function StrengthMeter({ value }: { value: string }) {
  const score = pwScore(value);
  const checks = pwChecks(value);
  return (
    <div className={`strength s${score}`}>
      <div className="bars">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </div>
      <div className="lbl">
        <span>Password strength</span>
        <span className="v">{value ? LABELS[score] : "—"}</span>
      </div>
      <ul className="req-list">
        {REQS.map((r) => (
          <li key={r.key} className={checks[r.key] ? "met" : ""}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 13l4 4L19 7" />
            </svg>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- chrome bits ---- */

export function Divider({ label }: { label: string }) {
  return (
    <div className="divider">
      <span>{label}</span>
    </div>
  );
}

export function SwitchFoot({ text, link }: { text: string; link: ReactNode }) {
  return (
    <p className="switch-foot">
      {text} {link}
    </p>
  );
}

export function LegalFoot() {
  return (
    <div className="legal-foot">
      <div className="row">
        <a href="#">Terms</a>
        <a href="#">Privacy</a>
        <a href="#">Security</a>
        <a href="#">Status</a>
      </div>
      <div className="row">
        <span className="lang-pick">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
          </svg>
          English (US)
        </span>
      </div>
      <div className="row mono" style={{ fontSize: "10.5px", letterSpacing: ".04em" }}>
        © aLabs · app.alabs.dev
      </div>
    </div>
  );
}

export { Link };
