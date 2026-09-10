"use client";

/** Organization area layout — client-only mounted gate like the (app)
 *  layout (the shell reads localStorage tenant prefs), but rendered with
 *  the OrgShell: the project rail is replaced by the org rail
 *  (Overview · Activity · Projects · Members · Settings · Billing).
 *  Shares AppProvider with the project area, so the active org/tenant is
 *  one mental model across both surfaces. */
import { useEffect, useState, type ReactNode } from "react";
import { AppProvider } from "@/providers/app-provider";
import { OrgShell } from "@/features/org/org-shell";

export default function OrgLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="app">
        <div className="main" style={{ display: "grid", placeItems: "center" }}>
          <div className="muted">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <OrgShell>{children}</OrgShell>
    </AppProvider>
  );
}
