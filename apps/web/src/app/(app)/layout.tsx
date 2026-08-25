"use client";

/** Authenticated app layout. Rendered client-only (mounted gate): the shell
 *  reads localStorage for tenant/sidebar prefs and hydrates a mutable tasks
 *  store — neither exists during SSR, so we skip server rendering of the
 *  tree entirely to avoid hydration mismatches. */
import { useEffect, useState, type ReactNode } from "react";
import { AppProvider } from "@/providers/app-provider";
import { AppShell } from "@/components/app-shell";
import { TaskOverlays } from "@/features/tasks/overlays";

export default function AppLayout({ children }: { children: ReactNode }) {
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
      <AppShell>{children}</AppShell>
      <TaskOverlays />
    </AppProvider>
  );
}
