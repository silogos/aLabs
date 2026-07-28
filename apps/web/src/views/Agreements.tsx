/** Agreements view — master/detail split + lifecycle timeline + new-agreement modal. */
import { useMemo, useState } from "react";
import { useApp } from "../store.js";

type Tone = "accent" | "violet" | "info" | "warn";
type AgrTypeKey = "sow" | "nda" | "contract" | "proposal";
type AgrStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

interface AgrType {
  l: string;
  ic: string;
  tone: Tone;
}
interface Agreement {
  id: string;
  t: string;
  ty: AgrTypeKey;
  st: AgrStatus;
  party: string;
  val: number | null;
  cur: string | null;
  start: string | null;
  end: string | null;
  signed: string | null;
  sent: string | null;
  owner: string;
  docs: string[];
  terms: string;
}

const PEOPLE: [string, string, string][] = [
  ["ay", "Aisha Yusuf", "Product Manager"],
  ["mk", "Marco Keller", "Tech Lead"],
  ["lc", "Lin Chen", "Engineer"],
  ["dp", "Diego Pereira", "Engineer"],
  ["sr", "Sara Reinhardt", "QA"],
  ["jb", "Jonas Berg", "Designer"],
];
const who = (id: string) => PEOPLE.find((p) => p[0] === id)?.[1] ?? id;

const AGR_TYPE: Record<AgrTypeKey, AgrType> = {
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
};
const AGR_ST: Record<AgrStatus, [string, string]> = {
  draft: ["Draft", "neutral"],
  sent: ["Sent", "info"],
  accepted: ["Accepted", "ok"],
  rejected: ["Rejected", "danger"],
  expired: ["Expired", "warn"],
};
const AGR_TP_HINT: Record<AgrTypeKey, { ph: string; sub: string; terms: string }> = {
  sow: { ph: "Statement of work title", sub: "Deliverables · fixed fee or T&M", terms: "Scope, deliverables, milestones, acceptance criteria, and rate card." },
  nda: { ph: "Non-disclosure agreement title", sub: "Mutual confidentiality", terms: "Term length, confidential-info definition, carve-outs, and residual-knowledge clause." },
  contract: { ph: "Master contract title", sub: "Governing agreement", terms: "Billing terms, IP, indemnification, liability cap, and termination." },
  proposal: { ph: "Proposal title", sub: "Pre-contract estimate", terms: "Proposed scope, timeline, pricing, and validity period." },
};
const NOW_AGR = +new Date("2025-03-24");

const INITIAL_AGREEMENTS: Agreement[] = [
  { id: "AGR-301", t: "Master Services Agreement", ty: "contract", st: "accepted", party: "Acme Corporation", val: 240000, cur: "USD", start: "2025-01-01", end: "2025-12-31", signed: "2024-12-15", sent: "2024-12-02", owner: "ay", docs: ["Master services agreement", "Northwind SOW"], terms: "Master terms governing all Atlas work — monthly net-15 billing, IP assignment on full payment, mutual indemnification capped at fees paid in the prior 12 months, and a 30-day cure period for material breach." },
  { id: "AGR-302", t: "Platform 2.0 Statement of Work", ty: "sow", st: "accepted", party: "Acme Corporation", val: 180000, cur: "USD", start: "2025-03-01", end: "2025-08-31", signed: "2025-02-20", sent: "2025-02-18", owner: "ay", docs: ["Sprint 14 SOW"], terms: "Fixed-fee SOW for the Atlas Platform 2.0 delivery across six monthly milestones. Acceptance criteria defined per epic; any scope change requires a written amendment. Beta cutoff Mar 28, GA Aug 31." },
  { id: "AGR-303", t: "Mutual Non-Disclosure Agreement", ty: "nda", st: "accepted", party: "Globex Industries", val: null, cur: null, start: "2025-02-10", end: "2027-02-09", signed: "2025-02-10", sent: "2025-02-05", owner: "mk", docs: [], terms: "Two-year mutual NDA covering evaluation of the analytics module for a potential Globex partnership. Standard carve-outs for residual knowledge and independently developed IP; confidential info marked in writing." },
  { id: "AGR-304", t: "Analytics Module Statement of Work", ty: "sow", st: "sent", party: "Contoso Ltd", val: 96000, cur: "USD", start: null, end: null, signed: null, sent: "2025-03-18", owner: "ay", docs: ["Sprint 14 SOW"], terms: "Time-and-materials SOW for the reporting & analytics module — 480 hours over 12 weeks at the standard rate card (Appendix A). Awaiting Contoso counter-signature; work blocked until accepted." },
  { id: "AGR-305", t: "Mobile Companion App Proposal", ty: "proposal", st: "draft", party: "Initech", val: 54000, cur: "USD", start: null, end: null, signed: null, sent: null, owner: "jb", docs: [], terms: "Draft proposal for an iOS + Android companion app scoped off the Atlas API. Fixed price, 10-week build. Scope, timeline, and rate pending internal review before sending to Initech." },
  { id: "AGR-306", t: "Data Migration SOW", ty: "sow", st: "expired", party: "Hooli", val: 32000, cur: "USD", start: "2024-12-01", end: "2025-02-28", signed: "2024-11-20", sent: "2024-11-15", owner: "mk", docs: [], terms: "One-off data migration from the Hooli legacy CRM — completed and accepted Feb 28. Retained for audit; no active obligations. Renewal not requested." },
  { id: "AGR-307", t: "Support & SLA Addendum", ty: "contract", st: "accepted", party: "Acme Corporation", val: 48000, cur: "USD", start: "2024-09-01", end: "2025-04-15", signed: "2024-08-20", sent: "2024-08-15", owner: "mk", docs: [], terms: "Annual support addendum — 99.9% uptime SLA, 4-hour P1 response, 50 support hours/month included. Expires Apr 15; renewal quote (AGR-304 analytics) in flight." },
];

function toneVars(t: Tone): [string, string] {
  return t === "accent" ? ["var(--accent-soft)", "var(--accent)"] : [`var(--${t}-bg)`, `var(--${t})`];
}
function fmtD(s: string | null): string {
  if (!s) return "—";
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date(s + "T00:00:00");
  return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function money(v: number | null, c: string | null): string {
  if (v == null) return "—";
  const sym = c === "USD" ? "$" : c === "EUR" ? "€" : c === "GBP" ? "£" : c ? c + " " : "";
  return sym + v.toLocaleString("en");
}

function AgrIcon({ ic, size, sw }: { ic: string; size: number; sw: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} dangerouslySetInnerHTML={{ __html: ic }} />
  );
}

export function Agreements() {
  const { toast, setView } = useApp();
  const [agreements, setAgreements] = useState<Agreement[]>(INITIAL_AGREEMENTS);
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "expiring">("all");
  const [current, setCurrent] = useState("AGR-301");

  // new-agreement modal form state
  const [show, setShow] = useState(false);
  const [fTy, setFTy] = useState<AgrTypeKey>("sow");
  const [fTitle, setFTitle] = useState("");
  const [fParty, setFParty] = useState("");
  const [fOwner, setFOwner] = useState("ay");
  const [fVal, setFVal] = useState("");
  const [fCur, setFCur] = useState("USD");
  const [fStart, setFStart] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [fTerms, setFTerms] = useState("");

  const kpis = useMemo(() => {
    const value = agreements.filter((a) => a.st === "accepted").reduce((n, a) => n + (a.val || 0), 0);
    const active = agreements.filter((a) => a.st === "accepted").length;
    const pending = agreements.filter((a) => a.st === "sent" || a.st === "draft").length;
    const soon = agreements.filter((a) => a.end && a.st !== "rejected" && a.st !== "expired" && +new Date(a.end) - NOW_AGR <= 30 * 864e5 && +new Date(a.end) - NOW_AGR >= 0).length;
    return { value, active, pending, soon };
  }, [agreements]);

  const list = useMemo(() => {
    if (filter === "active") return agreements.filter((a) => a.st === "accepted");
    if (filter === "pending") return agreements.filter((a) => a.st === "sent" || a.st === "draft");
    if (filter === "expiring")
      return agreements.filter((a) => a.end && a.st !== "rejected" && a.st !== "expired" && +new Date(a.end) - NOW_AGR <= 30 * 864e5 && +new Date(a.end) - NOW_AGR >= 0);
    return agreements;
  }, [agreements, filter]);

  const a = agreements.find((x) => x.id === current) ?? agreements[0];
  const ty = AGR_TYPE[a.ty];
  const st = AGR_ST[a.st];
  const [bg, fg] = toneVars(ty.tone);

  const prog: Record<AgrStatus, number> = { draft: 0, sent: 1, accepted: 2, rejected: 2, expired: 2 };
  const finalLbl =
    a.st === "accepted" ? "Accepted & counter-signed" : a.st === "rejected" ? "Rejected by client" : a.st === "expired" ? "Agreement expired" : "Counter-signed";

  const steps = [
    { t: "Draft created", d: `${who(a.owner)} prepared the ${ty.l}${a.start ? " · effective " + fmtD(a.start) : ""}`, cls: prog[a.st] >= 0 ? "done" : "future", cur: a.st === "draft" },
    { t: `Sent to ${a.party}`, d: a.sent ? "Sent " + fmtD(a.sent) : "Not yet sent", cls: a.sent || prog[a.st] >= 1 ? "done" : "future", cur: a.st === "sent" },
    {
      t: finalLbl,
      d:
        a.st === "accepted" ? (a.signed ? "Counter-signed " + fmtD(a.signed) : "Awaiting counter-signature")
          : a.st === "rejected" ? "Declined " + (a.sent ? fmtD(a.sent) : "")
            : a.st === "expired" ? "Term ended " + (a.end ? fmtD(a.end) : "")
              : "Awaiting outcome",
      cls: prog[a.st] >= 2 ? "done" : "future",
      cur: prog[a.st] === 2,
      dot: a.st === "rejected" ? "danger" : a.st === "expired" ? "warn" : "",
    },
  ];

  function act(to: AgrStatus) {
    setAgreements((prev) =>
      prev.map((x) => {
        if (x.id !== current) return x;
        const na: Agreement = { ...x, st: to };
        if (to === "sent") na.sent = "2025-03-24";
        if (to === "accepted") {
          na.signed = "2025-03-24";
          if (!na.start) na.start = "2025-03-24";
        }
        return na;
      })
    );
    toast(`${current} → ${AGR_ST[to][0]}`);
  }

  function openModal() {
    setFTy("sow");
    setFTitle("");
    setFParty("");
    setFOwner("ay");
    setFVal("");
    setFCur("USD");
    setFStart("");
    setFEnd("");
    setFTerms("");
    setShow(true);
  }

  function createDraft() {
    const title = fTitle.trim() || AGR_TYPE[fTy].l;
    const nextId = Math.max(0, ...agreements.map((x) => +x.id.split("-")[1])) + 1;
    const id = "AGR-" + nextId;
    const na: Agreement = {
      id,
      t: title,
      ty: fTy,
      st: "draft",
      party: fParty.trim() || "Unnamed client",
      val: fVal ? +fVal : null,
      cur: fVal ? fCur : null,
      start: fStart || null,
      end: fEnd || null,
      sent: null,
      signed: null,
      owner: fOwner,
      docs: [],
      terms: fTerms.trim() || AGR_TP_HINT[fTy].terms,
    };
    setAgreements((prev) => [na, ...prev]);
    setCurrent(id);
    setFilter("all");
    setShow(false);
    toast(`Created ${id} as draft`);
  }

  const SEG: ["all", "active", "pending", "expiring"] = ["all", "active", "pending", "expiring"];

  return (
    <>
      <section className="view active">
      <div className="toolbar">
        <div className="seg">
          {SEG.map((s) => (
            <button key={s} className={filter === s ? "on" : ""} onClick={() => setFilter(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn subtle sm" onClick={() => toast("Exported agreements · CSV")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Export
          </button>
          <button className="btn primary sm" onClick={openModal}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            New agreement
          </button>
        </div>
      </div>

      <div className="grid g4" style={{ marginBottom: 14 }}>
        <div className="card kpi"><div className="label">Contract value</div><div className="val" style={{ color: "var(--accent)" }}>{money(kpis.value, "USD")}</div><div className="sub">{kpis.active} accepted</div></div>
        <div className="card kpi"><div className="label">Active</div><div className="val" style={{ color: "var(--ok)" }}>{kpis.active}</div><div className="sub">accepted</div></div>
        <div className="card kpi"><div className="label">Pending signature</div><div className="val">{kpis.pending}</div><div className="sub">awaiting client</div></div>
        <div className="card kpi"><div className="label">Expiring soon</div><div className="val" style={{ color: "var(--warn)" }}>{kpis.soon}</div><div className="sub">≤ 30 days</div></div>
      </div>

      <div className="agr-grid">
        <div className="card">
          <div className="panel-head"><h3>Agreements</h3><span className="muted">{list.length} {filter === "all" ? "total" : filter}</span></div>
          <div className="panel-body flush">
            {list.length === 0 && <div className="tiny faint" style={{ padding: 20, textAlign: "center" }}>No agreements in this view</div>}
            {list.map((x) => {
              const xty = AGR_TYPE[x.ty];
              const xst = AGR_ST[x.st];
              const [xbg, xfg] = toneVars(xty.tone);
              return (
                <div key={x.id} className={`agr-item ${x.id === current ? "sel" : ""}`} onClick={() => setCurrent(x.id)}>
                  <div className="ai-top">
                    <span className="ai-ic" style={{ background: xbg, color: xfg }}><AgrIcon ic={xty.ic} size={14} sw={1.8} /></span>
                    <span className="ai-title">{x.t}</span>
                  </div>
                  <div className="ai-mid">
                    <span className="tag">{xty.l}</span>
                    <span className={`status ${xst[1]}`}><span className="d"></span>{xst[0]}</span>
                  </div>
                  <div className="ai-foot">
                    <span className="small muted truncate" style={{ maxWidth: 150 }}>{x.party}</span>
                    <span className="small mono">{money(x.val, x.cur)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card agr-detail">
          <div className="agr-head">
            <span className="agr-icbig" style={{ background: bg, color: fg }}><AgrIcon ic={ty.ic} size={22} sw={1.7} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                <span className="tag">{ty.l}</span>
                <span className={`status ${st[1]}`}><span className="d"></span>{st[0]}</span>
                <span className="tid">{a.id}</span>
              </div>
              <h2>{a.t}</h2>
              <div className="agr-sub">{a.party}</div>
            </div>
            {a.st === "draft" && <div className="agr-actions"><button className="btn primary sm" onClick={() => act("sent")}>Send to client</button></div>}
            {a.st === "sent" && (
              <div className="agr-actions">
                <button className="btn primary sm" onClick={() => act("accepted")}>Mark accepted</button>
                <button className="btn subtle sm" onClick={() => act("rejected")}>Decline</button>
              </div>
            )}
          </div>

          <div className="agr-facts">
            <div className="fact"><div className="fl">Contract value</div><div className="fv">{money(a.val, a.cur)}</div></div>
            <div className="fact"><div className="fl">Effective</div><div className="fv">{fmtD(a.start)}</div></div>
            <div className="fact"><div className="fl">Expires</div><div className="fv">{fmtD(a.end)}</div></div>
            <div className="fact"><div className="fl">Counter-signed</div><div className="fv">{fmtD(a.signed)}</div></div>
          </div>

          <div className="agr-parties">
            <div className="agr-party">
              <span className="av a" style={{ width: 34, height: 34, fontSize: 12 }}>NW</span>
              <div><div className="role">Provider</div><div className="nm">Northwind</div></div>
            </div>
            <div className="agr-party">
              <span className="av b" style={{ width: 34, height: 34, fontSize: 12 }}>{a.party.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <div><div className="role">Client</div><div className="nm">{a.party}</div></div>
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

          {a.docs.length > 0 && (
            <>
              <div className="agr-sec">Attached documents</div>
              <div className="agr-docs">
                {a.docs.map((d) => (
                  <div key={d} className="agr-doc" onClick={() => { setView("documents"); toast("Opening " + d); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ color: "var(--accent)", flex: "none" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                    <span className="dnm">{d}</span>
                    <span className="tiny muted" style={{ marginLeft: "auto" }}>Open →</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="agr-sec">Terms</div>
          <div className="agr-terms">{a.terms}</div>
        </div>
      </div>
      </section>

      {show && (
        <div className="modal show" onClick={(e) => e.target === e.currentTarget && setShow(false)}>
          <div className="mh">
            <h3>New agreement</h3>
            <span className="status neutral"><span className="d"></span>Draft</span>
            <button className="x" onClick={() => setShow(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="mb">
            <span className="flab">Type / template</span>
            <div className="tp">
              {(Object.keys(AGR_TYPE) as AgrTypeKey[]).map((k) => {
                const v = AGR_TYPE[k];
                const [tbg, tfg] = toneVars(v.tone);
                return (
                  <button key={k} type="button" className={`tp-card ${k === fTy ? "on" : ""}`} onClick={() => setFTy(k)}>
                    <span className="tp-ic" style={{ background: tbg, color: tfg }}><AgrIcon ic={v.ic} size={15} sw={1.8} /></span>
                    <span className="tp-l">{v.l}</span>
                    <span className="tp-s">{AGR_TP_HINT[k].sub}</span>
                  </button>
                );
              })}
            </div>

            <span className="flab">Title</span>
            <input className="fld" value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder={AGR_TP_HINT[fTy].ph} style={{ marginBottom: 12 }} />

            <div className="frow">
              <div>
                <span className="flab">Client / counterparty</span>
                <input className="fld" value={fParty} onChange={(e) => setFParty(e.target.value)} list="agr-clients" placeholder="Search or type a client" />
              </div>
              <div>
                <span className="flab">Internal owner</span>
                <select className="fld" value={fOwner} onChange={(e) => setFOwner(e.target.value)}>
                  {PEOPLE.map(([id, nm, role]) => <option key={id} value={id}>{nm} · {role}</option>)}
                </select>
              </div>
            </div>
            <datalist id="agr-clients">
              <option>Acme Corporation</option>
              <option>Contoso Ltd</option>
              <option>Globex Industries</option>
              <option>Initech</option>
              <option>Hooli</option>
            </datalist>

            <div className="frow">
              <div>
                <span className="flab">Contract value</span>
                <div className="val-in">
                  <input className="fld" type="number" min={0} step={1000} value={fVal} onChange={(e) => setFVal(e.target.value)} placeholder="0" />
                  <select className="fld" value={fCur} onChange={(e) => setFCur(e.target.value)}>
                    <option>USD</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
              </div>
              <div>
                <span className="flab">Term · effective → expires</span>
                <div className="dates">
                  <input className="fld" type="date" value={fStart} onChange={(e) => setFStart(e.target.value)} />
                  <input className="fld" type="date" value={fEnd} onChange={(e) => setFEnd(e.target.value)} />
                </div>
              </div>
            </div>

            <span className="flab">Terms summary</span>
            <textarea className="fld" value={fTerms} onChange={(e) => setFTerms(e.target.value)} placeholder="Scope, milestones, payment terms, SLAs…"></textarea>
          </div>
          <div className="mf">
            <span className="left-meta">Saved as Draft · nothing is sent to the client yet</span>
            <button className="btn ghost" onClick={() => setShow(false)}>Cancel</button>
            <button className="btn primary" onClick={createDraft}>Create draft</button>
          </div>
        </div>
      )}
    </>
  );
}
