"use client";

/** Org billing — current plan (derived from the workspace type), real usage
 *  meters (active projects vs the personal cap, seats), and honest empty
 *  states for payment/invoices: payments aren't wired in this build, so
 *  nothing here is faked. */
import { useApp } from "@/providers/app-provider";
import { hueFor, projColor } from "@/components/nav-data";
import { useMembers } from "@/hooks/use-members";
import { PERSONAL_PROJECT_LIMIT } from "@pmin/core";
import { PERM, hasPerm } from "@/features/settings/model";

export function OrgBillingView() {
  const { org, projects, user, toast } = useApp();
  const { data: members } = useMembers(org?.id);

  const me = members?.find((m) => m.userId === user?.id);
  const canManage = hasPerm(me?.role.permissions, PERM.billingManage);

  if (!org || !projects) {
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );
  }

  const isPersonal = org.type === "personal";
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const archivedProjects = projects.filter((p) => p.status === "archived").length;
  const seats = members?.filter((m) => m.status === "active").length ?? 0;
  const projectPct = isPersonal
    ? Math.min(100, Math.round((activeProjects / PERSONAL_PROJECT_LIMIT) * 100))
    : null;

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Billing &amp; plan</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Plan and usage for {org.name}
          </div>
        </div>
        <button
          className="btn primary sm"
          disabled={!canManage}
          title={canManage ? undefined : "You don't have permission to manage billing"}
          onClick={() => toast("Plan management isn't wired to billing yet")}
          data-od-id="org-billing-manage-plan"
        >
          Manage plan
        </button>
      </div>

      <div className="grid g2" style={{ gap: 14, maxWidth: 980 }}>
        <div className="card" data-od-id="org-billing-current-plan">
          <div className="panel-head">
            <h3>Current plan</h3>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <span className="pico" style={{ background: projColor(hueFor(org.id)) }}>{org.name[0]}</span>
              <div>
                <div style={{ fontWeight: 650 }}>{isPersonal ? "Personal" : "Team"}</div>
                <div className="tiny faint">{org.slug}</div>
              </div>
            </div>
            <div className="small muted">
              {isPersonal
                ? `Free — single member, up to ${PERSONAL_PROJECT_LIMIT} active projects. Archiving a project frees its slot.`
                : "Standard team workspace — no project cap enforced in this build, billed per seat once payments are connected."}
            </div>
          </div>
        </div>

        <div className="card" data-od-id="org-billing-usage">
          <div className="panel-head">
            <h3>Usage</h3>
            <span className="muted">Live</span>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className="small" style={{ fontWeight: 600 }}>
                  Active projects
                </span>
                <span className="mono tiny muted">
                  {activeProjects}
                  {isPersonal ? ` / ${PERSONAL_PROJECT_LIMIT}` : ""}
                </span>
              </div>
              <div className={`bar ${projectPct !== null && projectPct >= 100 ? "warn" : ""}`}>
                <i style={{ width: `${projectPct ?? Math.min(100, activeProjects * 10)}%` }} />
              </div>
              {isPersonal && projectPct !== null && projectPct >= 100 && (
                <div className="tiny" style={{ color: "var(--warn)", marginTop: 5 }}>
                  Project limit reached — archive a project to free a slot.
                </div>
              )}
            </div>
            <div>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className="small" style={{ fontWeight: 600 }}>
                  Seats (active members)
                </span>
                <span className="mono tiny muted">
                  {seats}
                  {isPersonal ? " / 1" : ""}
                </span>
              </div>
              <div className="bar">
                <i style={{ width: isPersonal ? "100%" : `${Math.min(100, seats * 10)}%` }} />
              </div>
            </div>
            <div className="row between">
              <span className="small" style={{ fontWeight: 600 }}>
                Archived projects
              </span>
              <span className="mono tiny muted">{archivedProjects}</span>
            </div>
          </div>
        </div>

        <div className="card" data-od-id="org-billing-payment">
          <div className="panel-head">
            <h3>Payment method</h3>
          </div>
          <div className="panel-body">
            <div className="tiny faint">
              No payment method configured — payments aren&apos;t wired in this build. Nothing is
              being charged.
            </div>
          </div>
        </div>

        <div className="card" data-od-id="org-billing-invoices">
          <div className="panel-head">
            <h3>Billing history</h3>
          </div>
          <div className="panel-body">
            <div className="tiny faint">
              Invoices will appear here once billing is connected to a payment provider.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
