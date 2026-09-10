"use client";

/** User area layout — the entry surface (/, /user, /notifications),
 *  rendered client-only (mounted gate; the provider reads localStorage
 *  tenant prefs, which don't exist during SSR). Wraps everything in the
 *  UserShell: the account rail with the dashboard/profile/notifications
 *  nav plus the workspaces menu (orgs → projects). */
import { useEffect, useState, type ReactNode } from "react";
import { AppProvider } from "@/providers/app-provider";
import { UserShell } from "@/features/user/user-shell";

export default function UserAreaLayout({ children }: { children: ReactNode }) {
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
