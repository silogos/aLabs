"use client";

/** User area layout — client-only mounted gate like the (org)
 *  layout (the shell reads localStorage tenant prefs), but rendered with
 *  the UserShell: the project rail is replaced by the account rail
 *  (Profile · Notifications). Shares AppProvider with the project and org
 *  areas, so the active org/tenant is one mental model across all surfaces. */
import { useEffect, useState, type ReactNode } from "react";
import { AppProvider } from "@/providers/app-provider";
import { UserShell } from "@/features/user/user-shell";

export default function UserLayout({ children }: { children: ReactNode }) {
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
      <UserShell>{children}</UserShell>
    </AppProvider>
  );
}
