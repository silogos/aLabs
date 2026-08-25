/** Centered nav modals — Account (identity + switch-workspace entry + account rows),
 *  Project switcher (search + recents + this-org projects), Org switcher (search,
 *  lands on the org's derived landing project). Design: separated switchers,
 *  420px modals. Rows render live API data (store.tsx). */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { api } from "../api";
import { useApp } from "../store";
import type { Project } from "../api";
import { hueFor, projColor, CheckIcon, ChevRight } from "./navData";

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="switch-search">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  odId,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  odId: string;
}) {
  return (
    <div className="modal show" style={{ width: 420 }} data-od-id={odId}>
      <div className="mh">
        <h3>{title}</h3>
        <button className="x" aria-label="Close" onClick={onClose}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mb">{children}</div>
    </div>
  );
}

/* ---------------- Account ---------------- */

const rowIcon = {
  profile: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  notif: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  appearance: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  ),
  signout: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

function AccountModal() {
  const { user, org, setNavModal, toast } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const name = user?.name ?? "Aisha Yusuf";
  const email = user?.email ?? "aisha@northwind.io";
  const signOut = async () => {
    setNavModal(null);
    try {
      await api.logout();
    } catch {
      /* session is cleared client-side regardless */
    }
    queryClient.clear();
    router.replace("/login");
  };
  const acctRow = (key: keyof typeof rowIcon, label: string, msg: string) => (
    <button
      className={`mrow ${key === "signout" ? "danger" : ""}`}
      onClick={() => {
        if (key === "signout") {
          void signOut();
          return;
        }
        setNavModal(null);
        toast(msg);
      }}
    >
      {rowIcon[key]}
      {label}
    </button>
  );
  return (
    <ModalShell title="Account" onClose={() => setNavModal(null)} odId="account-modal">
      <div className="acct-id">
        <span className="av">{name[0]}</span>
        <span className="txt">
          <b>{name}</b>
          <small>{email} · Product Manager</small>
        </span>
      </div>
      <button className="acct-entry" onClick={() => setNavModal("org")}>
        <span className="ic">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h6M9 13h6M9 17h6" />
          </svg>
        </span>
        <span className="tx">
          <b>Switch workspace</b>
          <small>{org?.name ?? "Workspace"}</small>
        </span>
        {ChevRight("ch")}
      </button>
      <div className="acct-sep"></div>
      {acctRow("profile", "Profile settings", "Profile settings — coming soon")}
      {acctRow("notif", "Notifications", "Notifications — coming soon")}
      {acctRow("appearance", "Appearance", "Appearance — coming soon")}
      <div className="acct-sep"></div>
      {acctRow("signout", "Sign out", "Signed out of aLabs")}
    </ModalShell>
  );
}

/* ---------------- Project switcher ---------------- */

function ProjectSwitchModal() {
  const { project, org, projects, recents, switchProject, setNavModal } = useApp();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = (p: Project) =>
    !query || p.name.toLowerCase().includes(query) || p.key.toLowerCase().includes(query);
  // recents: server visit history (most-recent-first), kept to this org's
  // loaded projects, top 3 — same order as the server
  const recs =
    projects
      ?.filter((p) => (recents ?? []).some((r) => r.project.id === p.id) && match(p))
      .sort(
        (a, b) =>
          recents!.findIndex((r) => r.project.id === a.id) -
          recents!.findIndex((r) => r.project.id === b.id),
      )
      .slice(0, 3) ?? [];
  const recIds = new Set(recs.map((p) => p.id));
  const rest = (projects ?? []).filter((p) => match(p) && !recIds.has(p.id));

  const row = (p: Project) => (
    <button
      key={p.id}
      className={`sw-row ${p.id === project?.id ? "on" : ""}`}
      onClick={() => switchProject(p)}
    >
      <span className="pdot" style={{ background: projColor(hueFor(p.id)) }}>
        {p.icon ?? p.name[0]}
      </span>
      <span className="nm">{p.name}</span>
      <span className="sub">{p.key}</span>
      {CheckIcon}
    </button>
  );

  return (
    <ModalShell
      title="Switch project"
      onClose={() => setNavModal(null)}
      odId="project-switcher-modal"
    >
      <SearchField value={q} onChange={setQ} placeholder="Search projects" />
      {recs.length > 0 && <div className="switch-lbl">Recent</div>}
      {recs.map(row)}
      {rest.length > 0 && (
        <div className="switch-lbl">
          {query ? `More in ${org?.name}` : `All projects in ${org?.name}`}
        </div>
      )}
      {rest.map(row)}
      {recs.length === 0 && rest.length === 0 && (
        <div className="switch-empty">
          {query ? `No projects match "${query}".` : "No projects in this workspace yet."}
        </div>
      )}
    </ModalShell>
  );
}

/* ---------------- Org switcher ---------------- */

function OrgSwitchModal() {
  const { org, orgs, switchOrg, setNavModal } = useApp();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  // per-org project counts reuse the ["projects", orgId] cache; useQueries
  // returns results in input order, i.e. aligned with `orgs`
  const all = orgs ?? [];
  const counts = useQueries({
    queries: all.map((o) => ({
      queryKey: ["projects", o.id],
      queryFn: () => api.projects(o.id),
    })),
  });
  const countByOrg = new Map(all.map((o, i) => [o.id, counts[i]?.data?.length ?? 0]));
  const list = all.filter((o) => !query || o.name.toLowerCase().includes(query));

  return (
    <ModalShell
      title="Switch workspace"
      onClose={() => setNavModal(null)}
      odId="workspace-switcher-modal"
    >
      <SearchField value={q} onChange={setQ} placeholder="Search workspaces" />
      {list.map((o) => {
        const cnt = countByOrg.get(o.id) ?? 0;
        return (
          <button
            key={o.id}
            className={`sw-row ${o.id === org?.id ? "on" : ""}`}
            onClick={() => switchOrg(o.id)}
          >
            <span className="pdot" style={{ background: projColor(hueFor(o.id)) }}>
              {o.name[0]}
            </span>
            <span className="nm">{o.name}</span>
            <span className="sub">
              {cnt} project{cnt === 1 ? "" : "s"}
            </span>
            {CheckIcon}
          </button>
        );
      })}
      {list.length === 0 && <div className="switch-empty">No workspaces match &quot;{query}&quot;.</div>}
    </ModalShell>
  );
}

export function NavModals() {
  const { navModal } = useApp();
  if (!navModal) return null;
  return (
    <>
      {navModal === "acct" && <AccountModal key="acct" />}
      {navModal === "proj" && <ProjectSwitchModal key="proj" />}
      {navModal === "org" && <OrgSwitchModal key="org" />}
    </>
  );
}
