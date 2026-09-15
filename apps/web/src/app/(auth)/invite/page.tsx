"use client";

/** Invitation accept page — /invite?token=… (the link admins copy from the
 *  members page; email delivery is deferred). The preview is a public
 *  token lookup, but accepting requires the session of exactly the invited
 *  account, so unauthenticated or wrong-account visitors get routed through
 *  sign-in / register with ?next= back here. */
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { authService } from "@/services/auth";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { BrandPanel } from "../_components/brand-panel";
import { Alert, LegalFoot, Link } from "../_components/auth-form";

function InviteView() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const router = useRouter();
  const qc = useQueryClient();
  const { user, toast } = useApp();

  const { data: inv, error } = useQuery({
    queryKey: qk.invitationPreview(token),
    queryFn: () => workspaceService.invitationPreview(token!),
    enabled: !!token,
  });

  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState<{ slug: string; name: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const backHere = `/invite?token=${encodeURIComponent(token)}`;
  const signIn = `/login?next=${encodeURIComponent(backHere)}`;
  const signUp = `/register?next=${encodeURIComponent(backHere)}`;
  const rightAccount = !!user && !!inv && user.email.toLowerCase() === inv.email;

  const accept = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await workspaceService.acceptInvitation(token);
      // the org list must already contain the new org when we land on
      // /{orgSlug} — the provider bounces unknown org slugs to /
      await qc.invalidateQueries({ queryKey: qk.orgs() });
      toast(`You joined ${res.organization.name}`);
      setJoined({ slug: res.organization.slug, name: res.organization.name });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const switchAccount = async () => {
    try {
      await authService.logout();
    } catch {
      /* the cookie is cleared server-side even if the call failed */
    }
    qc.clear();
    router.replace(signIn);
  };

  if (!token || error) {
    return (
      <Card>
        <div className="card-head">
          <div className="logo-sm">A</div>
          <h1>Invitation</h1>
        </div>
        <Alert kind="danger">
          {!token
            ? "This link is missing its invitation token — ask for a new invite link."
            : "This invitation link is invalid or no longer exists. Ask for a new one."}
        </Alert>
        <p className="switch-foot" style={{ marginTop: 18 }}>
          <Link href="/">Back to aLabs</Link>
        </p>
        <LegalFoot />
      </Card>
    );
  }

  if (joined) {
    return (
      <Card>
        <div className="sent-card" style={{ margin: "auto 0" }}>
          <div className="sent-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1>You&apos;re in</h1>
          <p className="sub">Welcome to {joined.name} — your workspace is ready.</p>
          <button
            className="btn primary full lg"
            style={{ marginTop: 18 }}
            onClick={() => router.push(`/${joined.slug}`)}
          >
            Continue to {joined.name}
          </button>
        </div>
        <LegalFoot />
      </Card>
    );
  }

  if (!inv) {
    return (
      <Card>
        <div className="card-head">
          <div className="logo-sm">A</div>
          <h1>Invitation</h1>
          <p className="sub">Checking this invitation…</p>
        </div>
        <LegalFoot />
      </Card>
    );
  }

  if (inv.status !== "pending") {
    const text =
      inv.status === "accepted"
        ? "This invitation has already been accepted."
        : inv.status === "cancelled"
          ? "This invitation was cancelled by the workspace."
          : "This invitation has expired. Ask for a new one.";
    return (
      <Card>
        <div className="card-head">
          <div className="logo-sm">A</div>
          <h1>Invitation</h1>
        </div>
        <Alert kind={inv.status === "accepted" ? "info" : "danger"}>{text}</Alert>
        <p className="switch-foot" style={{ marginTop: 18 }}>
          <Link href="/">Back to aLabs</Link>
        </p>
        <LegalFoot />
      </Card>
    );
  }

  return (
    <Card>
      <div className="card-head">
        <div className="logo-sm">A</div>
        <h1>Join {inv.organizationName}</h1>
        <p className="sub">
          You&apos;ve been invited to join {inv.organizationName} as {inv.roleName}.
        </p>
      </div>

      <div className="tiny muted" style={{ marginTop: 14 }}>
        Sent to {inv.email} · expires {dateShort(inv.expiresAt)}
      </div>

      {user && !rightAccount && (
        <div style={{ marginTop: 14 }}>
          <Alert kind="danger">
            You&apos;re signed in as {user.email}, but this invitation is for {inv.email}. Switch
            to that account to accept it.
          </Alert>
        </div>
      )}

      {err && (
        <div style={{ marginTop: 14 }}>
          <Alert kind="danger">{err}</Alert>
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {!user ? (
          <>
            <button className="btn primary full lg" onClick={() => router.push(signIn)}>
              Sign in to accept
            </button>
            <button className="btn ghost full lg" onClick={() => router.push(signUp)}>
              Create an account with {inv.email}
            </button>
          </>
        ) : rightAccount ? (
          <button
            className={`btn primary full lg ${busy ? "loading" : ""}`}
            disabled={busy}
            onClick={() => void accept()}
          >
            <span className="spinner"></span>
            <span className="lbl-txt">Accept invitation</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ) : (
          <button className="btn primary full lg" onClick={() => void switchAccount()}>
            Switch account
          </button>
        )}
      </div>

      <LegalFoot />
    </Card>
  );
}

/** Shared card chrome — the split-pane right panel every auth page uses. */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <main className="form-panel">
      <div className="form-card">{children}</div>
    </main>
  );
}

export default function InvitePage() {
  return (
    <div className="auth">
      <BrandPanel />
      <Suspense fallback={<main className="form-panel" />}>
        <InviteView />
      </Suspense>
    </div>
  );
}
