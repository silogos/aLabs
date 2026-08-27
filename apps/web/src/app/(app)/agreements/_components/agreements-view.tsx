/** Agreements view — master/detail split + lifecycle timeline + new-agreement
 *  modal, on live API data (rows in Postgres, owner hydrated per project). */
import { agreementsService } from "@/services/agreements";
import { DatePicker } from "@/components/ui/date-picker";
import type { Agreement, AgreementStatus, AgreementType, User } from "@pmin/core";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";

import { qk } from "@/lib/query-keys";
import { usePeople } from "@/providers/people-provider";
import { AvKey } from "@/features/tasks/tasks-ui";

type Tone = "accent" | "violet" | "info" | "warn" | "neutral";
type Seg = "all" | "active" | "pending" | "expiring";

interface AgrType {
  l: string;
  ic: string;
  tone: Tone;
}

const AGR_TYPE: Record<AgreementType, AgrType> = {
  sow: {
    l: "SOW",
    ic: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h4M8 17h6"/>',
    tone: "accent",
  },
  nda: { l: "NDA", ic: '<path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/>', tone: "violet" },
  contract: {
    l: "Contract",
    ic: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13l2 2 4-4"/>',
    tone: "info",
  },
  proposal: {
    l: "Proposal",
    ic: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 11h6M9 15h4"/>',
    tone: "warn",
  },
  other: {
    l: "Other",
    ic: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    tone: "neutral",
  },
};
const AGR_ST: Record<AgreementStatus, [string, string]> = {
  draft: ["Draft", "neutral"],
  sent: ["Sent", "info"],
  accepted: ["Accepted", "ok"],
  rejected: ["Rejected", "danger"],
  expired: ["Expired", "warn"],
};
const AGR_TP_HINT: Record<AgreementType, { ph: string; sub: string; terms: string }> = {
  sow: {
    ph: "Statement of work title",
    sub: "Deliverables · fixed fee or T&M",
    terms: "Scope, deliverables, milestones, acceptance criteria, and rate card.",
  },
  nda: {
    ph: "Non-disclosure agreement title",
    sub: "Mutual confidentiality",
    terms: "Term length, confidential-info definition, carve-outs, and residual-knowledge clause.",
  },
  contract: {
    ph: "Master contract title",
    sub: "Governing agreement",
    terms: "Billing terms, IP, indemnification, liability cap, and termination.",
  },
  proposal: {
    ph: "Proposal title",
    sub: "Pre-contract estimate",
    terms: "Proposed scope, timeline, pricing, and validity period.",
  },
  other: { ph: "Agreement title", sub: "Uncategorized", terms: "Summary of the agreement terms." },
};

function toneVars(t: Tone): [string, string] {
  if (t === "accent") return ["var(--accent-soft)", "var(--accent)"];
  if (t === "neutral") return ["var(--bg2, var(--border))", "var(--muted)"];
  return [`var(--${t}-bg)`, `var(--${t})`];
}
function fmtD(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s);
  if (isNaN(+d)) return "—";
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function money(v: number | null, c: string | null): string {
  if (v == null) return "—";
  const sym = c === "USD" ? "$" : c === "EUR" ? "€" : c === "GBP" ? "£" : c ? c + " " : "";
  return sym + v.toLocaleString("en");
}

function AgrIcon({ ic, size, sw }: { ic: string; size: number; sw: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      dangerouslySetInnerHTML={{ __html: ic }}
    />
  );
}

export function AgreementsView() {
  const { project, toast } = useApp();
  const pid = project!.id;
  const qc = useQueryClient();
  const { data: agreements, isLoading } = useQuery({
    queryKey: qk.agreements(pid),
    queryFn: () => agreementsService.list(pid),
  });
  const { data: members } = useMembers(project?.organizationId);


  const [filter, setFilter] = useState<Seg>("all");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: qk.agreements(pid) });

  const all = useMemo(() => agreements ?? [], [agreements]);
  const expiring = (a: Agreement) => {
    if (!a.endDate || a.status === "rejected" || a.status === "expired") return false;
    const d = +new Date(a.endDate + "T00:00:00") - Date.now();
    return d <= 30 * 864e5 && d >= 0;
  };
  const kpis = useMemo(
    () => ({
      value: all.filter((a) => a.status === "accepted").reduce((n, a) => n + (a.value || 0), 0),
      active: all.filter((a) => a.status === "accepted").length,
      pending: all.filter((a) => a.status === "sent" || a.status === "draft").length,
      soon: all.filter(expiring).length,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [all],
  );
  const list = useMemo(() => {
    if (filter === "active") return all.filter((a) => a.status === "accepted");
    if (filter === "pending") return all.filter((a) => a.status === "sent" || a.status === "draft");
    if (filter === "expiring") return all.filter(expiring);
    return all;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, filter]);

  const a = all.find((x) => x.id === currentId) ?? list[0] ?? all[0];

  async function act(id: string, to: AgreementStatus) {
    try {
      await agreementsService.update(pid, id, { status: to });
      await refresh();
      toast(`Agreement ${AGR_ST[to][0].toLowerCase()}`);
    } catch (e) {
      toast((e as Error).message);
    }
  }
  async function remove(id: string, title: string) {
    try {
      await agreementsService.remove(pid, id);
      await refresh();
      toast(`"${title}" deleted`);
    } catch (e) {
      toast((e as Error).message);
    }
  }

  const SEG: Seg[] = ["all", "active", "pending", "expiring"];

  return (
    <>
      <section className="view active">
        <div className="toolbar">
          <div className="seg">
            {SEG.map((s) => (
              <button key={s} className={filter === s ? "on" : ""} onClick={() => setFilter(s)}>
                {s[0]!.toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }} className="row">
            <button className="btn subtle sm" onClick={() => toast("CSV export — coming soon")}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
            <button className="btn primary sm" onClick={() => setShow(true)}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New agreement
            </button>
          </div>
        </div>

        <div className="grid g4" style={{ marginBottom: 14 }}>
          <div className="card kpi">
            <div className="label">Contract value</div>
            <div className="val" style={{ color: "var(--accent)" }}>
              {money(kpis.value, "USD")}
            </div>
            <div className="sub">{kpis.active} accepted</div>
          </div>
          <div className="card kpi">
            <div className="label">Active</div>
            <div className="val" style={{ color: "var(--ok)" }}>
              {kpis.active}
            </div>
            <div className="sub">accepted</div>
          </div>
          <div className="card kpi">
            <div className="label">Pending signature</div>
            <div className="val">{kpis.pending}</div>
            <div className="sub">awaiting client</div>
          </div>
          <div className="card kpi">
            <div className="label">Expiring soon</div>
            <div className="val" style={{ color: "var(--warn)" }}>
              {kpis.soon}
            </div>
            <div className="sub">≤ 30 days</div>
          </div>
        </div>

        <div className="agr-grid">
          <div className="card">
            <div className="panel-head">
              <h3>Agreements</h3>
              <span className="muted">
                {list.length} {filter === "all" ? "total" : filter}
              </span>
            </div>
            <div className="panel-body flush">
              {isLoading && (
                <div className="tiny faint" style={{ padding: 20, textAlign: "center" }}>
                  Loading…
                </div>
              )}
              {!isLoading && list.length === 0 && (
                <div className="tiny faint" style={{ padding: 20, textAlign: "center" }}>
                  No agreements in this view
                </div>
              )}
              {list.map((x) => {
                const xty = AGR_TYPE[x.type ?? "other"];
                const xst = AGR_ST[x.status];
                const [xbg, xfg] = toneVars(xty.tone);
                return (
                  <div
                    key={x.id}
                    className={`agr-item ${x.id === a?.id ? "sel" : ""}`}
                    onClick={() => setCurrentId(x.id)}
                  >
                    <div className="ai-top">
                      <span className="ai-ic" style={{ background: xbg, color: xfg }}>
                        <AgrIcon ic={xty.ic} size={14} sw={1.8} />
                      </span>
                      <span className="ai-title">{x.title}</span>
                    </div>
                    <div className="ai-mid">
                      <span className="tag">{xty.l}</span>
                      <span className={`status ${xst[1]}`}>
                        <span className="d"></span>
                        {xst[0]}
                      </span>
                    </div>
                    <div className="ai-foot">
                      <span className="small muted truncate" style={{ maxWidth: 150 }}>
                        {x.counterparty}
                      </span>
                      <span className="small mono">{money(x.value, x.currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!a ? (
            <div className="card agr-detail tiny faint">
              No agreements yet — use “New agreement” to create the first one.
            </div>
          ) : (
            <AgreementDetail a={a} pid={pid} onStatus={act} onDelete={remove} />
          )}
        </div>
      </section>

      {show && (
        <NewAgreementModal
          pid={pid}
          members={members?.map((x) => x.user) ?? []}
          counterparties={[...new Set(all.map((a) => a.counterparty).filter(Boolean))]}
          onClose={() => setShow(false)}
          onCreated={async (id) => {
            await refresh();
            setCurrentId(id);
            setFilter("all");
          }}
        />
      )}
    </>
  );
}

/* ---------------- detail pane ---------------- */

function AgreementDetail({
  a,
  pid,
  onStatus,
  onDelete,
}: {
  a: Agreement;
  pid: string;
  onStatus: (id: string, to: AgreementStatus) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const ty = AGR_TYPE[a.type ?? "other"];
  const st = AGR_ST[a.status];
  const [bg, fg] = toneVars(ty.tone);
  void pid;

  const prog: Record<AgreementStatus, number> = {
    draft: 0,
    sent: 1,
    accepted: 2,
    rejected: 2,
    expired: 2,
  };
  const finalLbl =
    a.status === "accepted"
      ? "Accepted & counter-signed"
      : a.status === "rejected"
        ? "Rejected by client"
        : a.status === "expired"
          ? "Agreement expired"
          : "Counter-signed";
  const owner = usePeople().personOf(a.owner?.id);
  const ownerName = owner?.name ?? "Draft owner";

  const steps = [
    {
      t: "Draft created",
      d: `${ownerName} prepared the ${ty.l}${a.startDate ? " · effective " + fmtD(a.startDate) : ""}`,
      cls: prog[a.status] >= 0 ? "done" : "future",
      cur: a.status === "draft",
    },
    {
      t: `Sent to ${a.counterparty}`,
      d: a.sentAt ? "Sent " + fmtD(a.sentAt) : "Not yet sent",
      cls: a.sentAt || prog[a.status] >= 1 ? "done" : "future",
      cur: a.status === "sent",
    },
    {
      t: finalLbl,
      d:
        a.status === "accepted"
          ? a.signedAt
            ? "Counter-signed " + fmtD(a.signedAt)
            : "Awaiting counter-signature"
          : a.status === "rejected"
            ? "Declined " + (a.sentAt ? fmtD(a.sentAt) : "")
            : a.status === "expired"
              ? "Term ended " + (a.endDate ? fmtD(a.endDate) : "")
              : "Awaiting outcome",
      cls: prog[a.status] >= 2 ? "done" : "future",
      cur: prog[a.status] === 2,
      dot: a.status === "rejected" ? "danger" : a.status === "expired" ? "warn" : "",
    },
  ];

  return (
    <div className="card agr-detail">
      <div className="agr-head">
        <span className="agr-icbig" style={{ background: bg, color: fg }}>
          <AgrIcon ic={ty.ic} size={22} sw={1.7} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 7, alignItems: "center", flexWrap: "wrap" }}>
            <span className="tag">{ty.l}</span>
            <span className={`status ${st[1]}`}>
              <span className="d"></span>
              {st[0]}
            </span>
            <span className="tid">{a.id.slice(0, 8)}</span>
          </div>
          <h2>{a.title}</h2>
          <div className="agr-sub">{a.counterparty}</div>
        </div>
        {a.status === "draft" && (
          <div className="agr-actions">
            <button className="btn primary sm" onClick={() => onStatus(a.id, "sent")}>
              Send to client
            </button>
          </div>
        )}
        {a.status === "sent" && (
          <div className="agr-actions">
            <button className="btn primary sm" onClick={() => onStatus(a.id, "accepted")}>
              Mark accepted
            </button>
            <button className="btn subtle sm" onClick={() => onStatus(a.id, "rejected")}>
              Decline
            </button>
          </div>
        )}
      </div>

      <div className="agr-facts">
        <div className="fact">
          <div className="fl">Contract value</div>
          <div className="fv">{money(a.value, a.currency)}</div>
        </div>
        <div className="fact">
          <div className="fl">Effective</div>
          <div className="fv">{fmtD(a.startDate)}</div>
        </div>
        <div className="fact">
          <div className="fl">Expires</div>
          <div className="fv">{fmtD(a.endDate)}</div>
        </div>
        <div className="fact">
          <div className="fl">Counter-signed</div>
          <div className="fv">{fmtD(a.signedAt)}</div>
        </div>
      </div>

      <div className="agr-parties">
        <div className="agr-party">
          <span className="av a" style={{ width: 34, height: 34, fontSize: 12 }}>
            NW
          </span>
          <div>
            <div className="role">Provider</div>
            <div className="nm">Northwind</div>
          </div>
        </div>
        <div className="agr-party">
          <span className="av b" style={{ width: 34, height: 34, fontSize: 12 }}>
            {a.counterparty
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <div className="role">Client</div>
            <div className="nm">{a.counterparty}</div>
          </div>
        </div>
        <div className="agr-party">
          {a.owner ? (
            <AvKey id={a.owner.id} size="" />
          ) : (
            <span className="av c" style={{ width: 34, height: 34, fontSize: 12 }}>
              —
            </span>
          )}
          <div>
            <div className="role">Internal owner</div>
            <div className="nm">{a.owner?.name ?? "Unassigned"}</div>
          </div>
        </div>
      </div>

      <div className="agr-sec">Lifecycle</div>
      <div className="timeline">
        {steps.map((s, i) => (
          <div key={i} className={`tl-step ${s.cls} ${s.cur ? "cur" : ""} ${s.dot || ""}`}>
            <div className="tl-t">{s.t}</div>
            <div className="tl-d">{s.d}</div>
          </div>
        ))}
      </div>

      <div className="agr-sec">Terms</div>
      <div className="agr-terms">{a.terms || "No terms summary captured."}</div>

      <div
        className="row"
        style={{ gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}
      >
        <button
          className="btn ghost sm"
          style={{ color: "var(--danger)", marginLeft: "auto" }}
          onClick={() => onDelete(a.id, a.title)}
        >
          Delete agreement
        </button>
      </div>
    </div>
  );
}

/* ---------------- new-agreement modal ---------------- */

function NewAgreementModal({
  pid,
  members,
  counterparties,
  onClose,
  onCreated,
}: {
  pid: string;
  members: User[];
  counterparties: string[];
  onClose: () => void;
  onCreated: (id: string) => void | Promise<void>;
}) {
  const { toast } = useApp();
  const [fTy, setFTy] = useState<AgreementType>("sow");
  const [fTitle, setFTitle] = useState("");
  const [fParty, setFParty] = useState("");
  const [fOwner, setFOwner] = useState("");
  const [fVal, setFVal] = useState("");
  const [fCur, setFCur] = useState("USD");
  const [fStart, setFStart] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [fTerms, setFTerms] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  async function createDraft() {
    const title = fTitle.trim();
    if (!title) {
      setErr(true);
      return;
    }
    setBusy(true);
    try {
      const created = await agreementsService.create(pid, {
        title,
        type: fTy,
        counterparty: fParty.trim() || "Unnamed client",
        ...(fVal ? { value: +fVal, currency: fCur } : {}),
        ...(fStart ? { startDate: fStart } : {}),
        ...(fEnd ? { endDate: fEnd } : {}),
        ...(fOwner ? { ownerId: fOwner } : {}),
        terms: fTerms.trim() || AGR_TP_HINT[fTy].terms,
      });
      onClose();
      toast("Agreement created as draft");
      await onCreated(created.id);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mh">
        <h3>New agreement</h3>
        <span className="status neutral">
          <span className="d"></span>Draft
        </span>
        <button className="x" onClick={onClose}>
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
      <div className="mb">
        <span className="flab">Type / template</span>
        <div className="tp">
          {(["sow", "nda", "contract", "proposal"] as AgreementType[]).map((k) => {
            const v = AGR_TYPE[k];
            const [tbg, tfg] = toneVars(v.tone);
            return (
              <button
                key={k}
                type="button"
                className={`tp-card ${k === fTy ? "on" : ""}`}
                onClick={() => setFTy(k)}
              >
                <span className="tp-ic" style={{ background: tbg, color: tfg }}>
                  <AgrIcon ic={v.ic} size={15} sw={1.8} />
                </span>
                <span className="tp-l">{v.l}</span>
                <span className="tp-s">{AGR_TP_HINT[k].sub}</span>
              </button>
            );
          })}
        </div>

        <span className="flab">Title</span>
        <input
          className={`fld ${err ? "err" : ""}`}
          value={fTitle}
          onChange={(e) => {
            setFTitle(e.target.value);
            setErr(false);
          }}
          placeholder={AGR_TP_HINT[fTy].ph}
          style={{ marginBottom: 12 }}
        />
        {err && (
          <div className="fld-err show" style={{ marginBottom: 12 }}>
            Please enter a title.
          </div>
        )}

        <div className="frow">
          <div>
            <span className="flab">Client / counterparty</span>
            <input
              className="fld"
              value={fParty}
              onChange={(e) => setFParty(e.target.value)}
              list="agr-clients"
              placeholder="Search or type a client"
            />
          </div>
          <div>
            <span className="flab">Internal owner</span>
            <select className="fld" value={fOwner} onChange={(e) => setFOwner(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <datalist id="agr-clients">
          {counterparties.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </datalist>

        <div className="frow">
          <div>
            <span className="flab">Contract value</span>
            <div className="val-in">
              <input
                className="fld"
                type="number"
                min={0}
                step={1000}
                value={fVal}
                onChange={(e) => setFVal(e.target.value)}
                placeholder="0"
              />
              <select className="fld" value={fCur} onChange={(e) => setFCur(e.target.value)}>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>
          <div>
            <span className="flab">Term · effective → expires</span>
            <div className="dates">
              <DatePicker value={fStart} onChange={setFStart} />
              <DatePicker value={fEnd} onChange={setFEnd} />
            </div>
          </div>
        </div>

        <span className="flab">Terms summary</span>
        <textarea
          className="fld"
          value={fTerms}
          onChange={(e) => setFTerms(e.target.value)}
          placeholder="Scope, milestones, payment terms, SLAs…"
        ></textarea>
      </div>
      <div className="mf">
        <span className="left-meta">Saved as Draft · nothing is sent to the client yet</span>
        <button className="btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy} onClick={() => void createDraft()}>
          Create draft
        </button>
      </div>
    </div>
  );
}
