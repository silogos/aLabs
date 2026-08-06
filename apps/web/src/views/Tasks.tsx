/** Tasks view — enterprise task management: Board / List / Tree. */
import { useMemo, useState, useLayoutEffect, useRef, useCallback, type CSSProperties } from "react";
import { useApp } from "../store.js";
import { useTasksVersion, allTasks, subsOf, childrenOf, late, ptsTotal, progOf, taskById, COLS, SPRINTS, ST, P, who, EPIC_IDS, EPIC_META, bulkSetStatus, bulkSetAssignee, bulkDelete, setField, sprintRows, sprintStatusLabel, type StatusId, type TaskRow } from "./tasks-store.js";
import { TyIcon, TyTag, AvKey, StatusBadge, PrioBadge, PtsPill, EpicChip } from "./tasks-ui.js";

type Mode = "board" | "table" | "backlog";
type GroupBy = "none" | "sprint" | "epic" | "status" | "assignee";

// Board sprint rows derive live from the store (reflects created/changed sprints).
function sprintBoardRows(): { k: string; dot: string; name: string; meta: string }[] {
  return sprintRows().map((r) => {
    if (r.k === "backlog") return { k: "backlog", dot: "hollow", name: "Backlog", meta: `${r.total} issues` };
    const s = SPRINTS[r.k];
    return { k: r.k, dot: s.st === "active" ? "ok" : "", name: s.name, meta: `${sprintStatusLabel(r.k)} · ${r.total}` };
  });
}

/** Positions a toolbar popover at the trigger button's rect with sidebar-aware
 *  clamping, via position:fixed so it escapes `.content`'s overflow clipping. */
function usePopover(open: boolean, onClose: () => void) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });
  useLayoutEffect(() => {
    if (!open) return;
    const btn = btnRef.current, pop = popRef.current;
    if (!btn || !pop) return;
    const r = btn.getBoundingClientRect();
    const pw = pop.offsetWidth || 170, ph = pop.offsetHeight || 200;
    const gap = 6, m = 8;
    let left = r.right - pw, top = r.bottom + gap;
    if (left < m) left = m;
    if (left + pw > window.innerWidth - m) left = Math.max(m, window.innerWidth - m - pw, r.left);
    if (top + ph > window.innerHeight - m) top = Math.max(m, r.top - ph - gap);
    setStyle({ left: Math.round(left), top: Math.round(top), visibility: "visible" });
  }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      onClose();
    };
    const onScroll = () => onClose();
    const content = document.querySelector(".content");
    document.addEventListener("mousedown", onDown);
    content?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      content?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, onClose]);
  return { btnRef, popRef, style };
}

export function Tasks() {
  const tver = useTasksVersion();
  const { openTask, setCreateOpen } = useApp();
  const [mode, setMode] = useState<Mode>("board");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("sprint");
  const [density, setDensity] = useState<"comf" | "comp">("comf");
  const [colVis, setColVis] = useState<Record<string, boolean>>({
    type: true, key: true, summary: true, status: true, priority: true, assignee: true, sprint: true, points: true, due: true,
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [collapsedEpics, setCollapsedEpics] = useState<Set<string>>(new Set());
  const [collapsedBlNodes, setCollapsedBlNodes] = useState<Set<number>>(new Set());
  const [boardSprints, setBoardSprints] = useState<Set<string>>(new Set(["s14", "s13", "backlog"]));
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState(1);
  const [sprintPop, setSprintPop] = useState(false);
  const [colsPop, setColsPop] = useState(false);
  const closePops = useCallback(() => { setSprintPop(false); setColsPop(false); }, []);
  const sprintPopState = usePopover(sprintPop, closePops);
  const colsPopState = usePopover(colsPop, closePops);

  const ql = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      allTasks().filter((t) => {
        if (t.ty === "epic") return false;
        if (t.parent) return false;
        if (ql && !(`atl-${t.id}`.includes(ql) || t.t.toLowerCase().includes(ql) || (t.lb || []).join(" ").toLowerCase().includes(ql))) return false;
        return true;
      }),
    [ql, tver],
  );

  const toggleSet = <T,>(set: Set<T>, val: T): Set<T> => {
    const n = new Set(set);
    if (n.has(val)) n.delete(val);
    else n.add(val);
    return n;
  };

  return (
    <section className={`view active view-${mode}`} data-od-id="view-tasks">
      <div className="toolbar">
        <div className="seg">
          {(["board", "table", "backlog"] as Mode[]).map((m) => (
            <button key={m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>
              {m === "board" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="6" height="18" rx="1" /><rect x="10" y="3" width="6" height="12" rx="1" /><rect x="17" y="3" width="4" height="8" rx="1" /></svg>}
              {m === "table" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" /></svg>}
              {m === "backlog" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M3 12h12M3 18h6" /><circle cx="19" cy="16" r="2.5" /></svg>}
              {m === "board" ? "Board" : m === "table" ? "List" : "Tree"}
            </button>
          ))}
        </div>

        <div className="tk-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search issues, keys, labels…" />
        </div>

        {mode === "board" && (
          <div className="cols-wrap">
            <button ref={sprintPopState.btnRef} className={`chip btn ${sprintPop ? "on" : ""}`} onClick={() => { setSprintPop((v) => !v); setColsPop(false); }} title="Choose which sprints the board shows">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="11" height="12" rx="2" /><rect x="11" y="6" width="11" height="12" rx="2" /></svg>
              Sprint <span className="cnt-badge">{boardSprints.size === sprintBoardRows().length ? "All" : String(boardSprints.size)}</span>
            </button>
            {sprintPop && (
              <div ref={sprintPopState.popRef} className="cols-pop sprint-pop" style={sprintPopState.style}>
                <div className="cp-h">Board sprints</div>
                {sprintBoardRows().map((r) => (
                  <label key={r.k} className="cp-row">
                    <input type="checkbox" className="ck" checked={boardSprints.has(r.k)} onChange={() => setBoardSprints((s) => toggleSet(s, r.k))} />
                    <span className={`sp-dot ${r.dot}`} />
                    <span className="sp-name">{r.name}</span>
                    <span className="sp-meta">{r.meta}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === "table" && (
          <>
            <label className="sel-wrap"><span>Group</span>
              <select className="sel" value={groupBy} onChange={(e) => { setGroupBy(e.target.value as GroupBy); setCollapsedGroups(new Set()); }}>
                <option value="none">None</option>
                <option value="sprint">Sprint</option>
                <option value="epic">Epic</option>
                <option value="status">Status</option>
                <option value="assignee">Assignee</option>
              </select>
            </label>
            <label className="sel-wrap"><span>Density</span>
              <select className="sel" value={density} onChange={(e) => setDensity(e.target.value as "comf" | "comp")}>
                <option value="comf">Comfortable</option>
                <option value="comp">Compact</option>
              </select>
            </label>
            <div className="cols-wrap">
              <button ref={colsPopState.btnRef} className={`chip btn ${colsPop ? "on" : ""}`} onClick={() => { setColsPop((v) => !v); setSprintPop(false); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="5" rx="1" /><rect x="3" y="14" width="10" height="6" rx="1" /></svg>
                Columns
              </button>
              {colsPop && (
                <div ref={colsPopState.popRef} className="cols-pop" style={colsPopState.style}>
                  <div className="cp-h">Toggle columns</div>
                  {["type", "key", "status", "priority", "assignee", "sprint", "points", "due"].map((c) => (
                    <label key={c} className="cp-row">
                      <input type="checkbox" className="ck" checked={colVis[c]} onChange={() => setColVis((v) => ({ ...v, [c]: !v[c] }))} />
                      {c === "type" ? "Type" : c === "key" ? "Key" : c[0].toUpperCase() + c.slice(1)}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn primary sm" onClick={() => setCreateOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            Create
          </button>
        </div>
      </div>

      {mode === "board" && <Board filtered={filtered} boardSprints={boardSprints} onOpen={openTask} />}
      {mode === "table" && (
        <TableView
          filtered={filtered}
          colVis={colVis}
          density={density}
          groupBy={groupBy}
          sortBy={sortBy}
          sortDir={sortDir}
          selected={selected}
          expandedRows={expandedRows}
          collapsedGroups={collapsedGroups}
          onSort={(k) => { setSortBy((cur) => { if (cur === k) { setSortDir((d) => -d); return cur; } setSortDir(1); return k; }); }}
          onToggleRow={(id) => setExpandedRows((s) => toggleSet(s, id))}
          onToggleGroup={(gk) => setCollapsedGroups((s) => toggleSet(s, gk))}
          onCheck={(id, on) => setSelected((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; })}
          onOpen={openTask}
        />
      )}
      {mode === "backlog" && (
        <Backlog
          filtered={filtered}
          collapsedEpics={collapsedEpics}
          collapsedBlNodes={collapsedBlNodes}
          onToggleEpic={(id) => setCollapsedEpics((s) => toggleSet(s, String(id)))}
          onToggleNode={(id) => setCollapsedBlNodes((s) => toggleSet(s, id))}
          onOpen={openTask}
        />
      )}

      {selected.size > 0 && (
        <div className="bulk-bar show">
          <b>{selected.size} selected</b>
          <span className="bulk-sep" />
          <select className="sel sm" value="" onChange={(e) => { if (e.target.value) { bulkSetStatus([...selected], e.target.value as StatusId); setSelected(new Set()); } }}>
            <option value="">Set status…</option>
            {COLS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="sel sm" value="" onChange={(e) => { if (e.target.value) { bulkSetAssignee([...selected], e.target.value); setSelected(new Set()); } }}>
            <option value="">Assign to…</option>
            {Object.keys(P).map((k) => <option key={k} value={k}>{who(k)}</option>)}
          </select>
          <button className="btn ghost sm danger" onClick={() => { bulkDelete([...selected]); setSelected(new Set()); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
            Delete
          </button>
          <button className="link" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}
    </section>
  );
}

/* ============================ BOARD ============================ */
function Board({ filtered, boardSprints, onOpen }: { filtered: TaskRow[]; boardSprints: Set<string>; onOpen: (id: string) => void }) {
  useTasksVersion();
  const { toast } = useApp();
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const list = filtered.filter((t) => boardSprints.has(t.sp || "backlog"));

  const drop = (statusId: StatusId, id: number | null) => {
    setOverCol(null);
    if (!id) return;
    const t = taskById(id);
    if (!t || t.s === statusId) { setDragId(null); return; }
    setField(id, "s", statusId);
    setDragId(null);
    toast(`ATL-${id} → ${ST[statusId][0]}`);
  };

  return (
    <div className="board-scroll">
      <div className="board">
        {COLS.map((c) => {
          const items = list.filter((t) => t.s === c.id);
          const pts = ptsTotal(items);
          return (
            <div className="col" key={c.id}>
              <div className="col-h">
                <span className="cd" style={{ background: c.dot }} />
                {c.name}
                <span className="cnt">{items.length}</span>
                <span className="pts">{pts}pts</span>
              </div>
              <div
                className={`col-body ${overCol === c.id ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setOverCol(c.id); }}
                onDragLeave={() => setOverCol((x) => (x === c.id ? null : x))}
                onDrop={(e) => drop(c.id, dragId)}
              >
                {items.map((t) => (
                  <Card key={t.id} t={t} dragging={dragId === t.id} onOpen={onOpen}
                    onDragStart={() => setDragId(t.id)} onDragEnd={() => setDragId(null)} />
                ))}
                {items.length === 0 && (
                  <div className="tiny faint empty-col">No issues here · <span className="link">add one</span></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ t, dragging, onOpen, onDragStart, onDragEnd }: { t: TaskRow; dragging: boolean; onOpen: (id: string) => void; onDragStart: () => void; onDragEnd: () => void }) {
  const subs = subsOf(t.id);
  const subd = subs.filter((s) => s.s === "done").length;
  return (
    <div className={`tcard ${dragging ? "dragging" : ""}`} draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={() => onOpen(String(t.id))}>
      <div className="ttop"><span className="tid">ATL-{t.id}</span><TyTag ty={t.ty} /></div>
      <div className="tt">{t.t}</div>
      {t.epic && <div className="epic-line"><EpicChip epic={t.epic} /></div>}
      {(t.lb || []).length > 0 && (
        <div className="trow">{(t.lb || []).slice(0, 3).map((l) => <span className="tag" key={l}>{l}</span>)}</div>
      )}
      <div className="tmeta">
        <PrioBadge p={t.p} />
        {subs.length > 0 && (
          <span className="ic"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>{subd}/{subs.length}</span>
        )}
        {(t.com || []).length > 0 && (
          <span className="ic"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>{(t.com || []).length}</span>
        )}
        <PtsPill pts={t.pts} />
        <span className={`due ${late(t) ? "late" : ""}`}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>{t.due}</span>
        <AvKey id={t.a} size="sm" />
      </div>
    </div>
  );
}

/* ============================ TABLE ============================ */
const COL_DEFS = [
  { k: "type", label: "", w: 46 },
  { k: "key", label: "Key", w: 84 },
  { k: "summary", label: "Summary", w: 360 },
  { k: "status", label: "Status", w: 120 },
  { k: "priority", label: "Priority", w: 96 },
  { k: "assignee", label: "Assignee", w: 140 },
  { k: "sprint", label: "Sprint", w: 90 },
  { k: "points", label: "Pts", w: 54 },
  { k: "due", label: "Due", w: 88 },
];

function TableView(props: {
  filtered: TaskRow[];
  colVis: Record<string, boolean>;
  density: string;
  groupBy: GroupBy;
  sortBy: string | null;
  sortDir: number;
  selected: Set<number>;
  expandedRows: Set<number>;
  collapsedGroups: Set<string>;
  onSort: (k: string) => void;
  onToggleRow: (id: number) => void;
  onToggleGroup: (gk: string) => void;
  onCheck: (id: number, on: boolean) => void;
  onOpen: (id: string) => void;
}) {
  useTasksVersion();
  const { filtered, colVis, density, groupBy, sortBy, sortDir, selected, expandedRows, collapsedGroups, onSort, onToggleRow, onToggleGroup, onCheck, onOpen } = props;
  const ver = useTasksVersion();
  const vis = COL_DEFS.filter((c) => colVis[c.k] || c.k === "summary");

  const sortList = (list: TaskRow[]) => {
    if (!sortBy) return list;
    const f = (t: TaskRow): string | number =>
      sortBy === "key" ? t.id : sortBy === "summary" ? t.t.toLowerCase() : sortBy === "points" ? t.pts || 0 : sortBy === "due" ? t.due || "" : sortBy === "priority" ? ["p1", "p2", "p3", "p4"].indexOf(t.p) : (t as unknown as Record<string, string>)[sortBy] || "";
    return [...list].sort((a, b) => { const x = f(a), y = f(b); return (x > y ? 1 : x < y ? -1 : 0) * sortDir; });
  };

  const groups = useMemo(() => {
    const list = sortList(filtered);
    if (groupBy === "none") return [{ key: "", label: "", items: list }];
    if (groupBy === "epic") {
      const out: { key: string; label: string; meta?: { c: string }; items: TaskRow[] }[] = [{ key: "none", label: "No epic", items: list.filter((t) => !t.epic) }];
      EPIC_IDS.forEach((eid) => { const e = taskById(eid); const items = list.filter((t) => t.epic === eid); if (items.length) out.push({ key: String(eid), label: e!.t, meta: { c: (EPIC_META[eid] || { c: "m" }).c }, items }); });
      return out.filter((g) => g.items.length);
    }
    if (groupBy === "status") return COLS.map((c) => { const items = list.filter((t) => t.s === c.id); return items.length ? { key: c.id, label: c.name, items } : null; }).filter(Boolean) as { key: string; label: string; items: TaskRow[] }[];
    if (groupBy === "assignee") {
      const out: { key: string; label: string; items: TaskRow[] }[] = [];
      Object.keys(P).forEach((k) => { const items = list.filter((t) => t.a === k); if (items.length) out.push({ key: k, label: who(k), items }); });
      const none = list.filter((t) => !P[t.a]);
      if (none.length) out.push({ key: "none", label: "Unassigned", items: none });
      return out;
    }
    // sprint
    const out: { key: string; label: string; sprint?: (typeof SPRINTS)[string]; items: TaskRow[] }[] = [];
    Object.keys(SPRINTS).forEach((sp) => { const items = list.filter((t) => t.sp === sp); if (items.length) out.push({ key: sp, label: SPRINTS[sp].name, sprint: SPRINTS[sp], items }); });
    const none = list.filter((t) => !t.sp);
    if (none.length) out.push({ key: "none", label: "Backlog", items: none });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, groupBy, sortBy, sortDir, ver]);

  const cellContent = (t: TaskRow, k: string) => {
    switch (k) {
      case "type": return <div className="cell-ic"><TyIcon ty={t.ty} /></div>;
      case "key": return <span className="mono id">ATL-{t.id}</span>;
      case "status": return <StatusBadge s={t.s} />;
      case "priority": return <PrioBadge p={t.p} />;
      case "assignee": return <span className="cell-who"><AvKey id={t.a} size="sm" /><span className="small truncate" style={{ maxWidth: 84 }}>{who(t.a).split(" ")[0]}</span></span>;
      case "sprint": return t.sp ? <span className="tag i">{SPRINTS[t.sp].name}</span> : <span className="tiny faint">Backlog</span>;
      case "points": return t.pts ? <span className="mono">{t.pts}</span> : <span className="faint">—</span>;
      case "due": return <span className={`mono ${late(t) ? "due-over" : "muted"}`}>{t.due}</span>;
      default: return null;
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="empty">
        <div className="empty-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg></div>
        <b>No issues match your view</b><p>Try clearing the search or switching to the Tree.</p>
      </div>
    );
  }

  return (
    <div id="task-table" className={density === "comp" ? "compact" : ""}>
      <div className="tbl-wrap">
      <div className="tbl-scroll">
        <table className="dt" id="task-table-el">
          <thead>
            <tr>
              <th className="ck-col"></th>
              {vis.map((c) => (
                <th key={c.k} className={`sortable ${sortBy === c.k ? "sorted" : ""}`} style={c.w ? { width: c.w } : undefined} onClick={() => onSort(c.k)}>
                  {c.k === "summary" ? <span className="srt-box" /> : c.label}
                  {sortBy === c.k && <span className={`srt-arr ${sortDir < 0 ? "d" : ""}`}>▲</span>}
                </th>
              ))}
              <th className="ck-col"></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const gk = groupBy + ":" + g.key;
              const gopen = !collapsedGroups.has(gk);
              const showGroup = groupBy !== "none";
              const prog = progOf(g.items);
              const meta = "meta" in g ? (g as { meta?: { c: string } }).meta : undefined;
              const sprint = "sprint" in g ? (g as { sprint?: (typeof SPRINTS)[string] }).sprint : undefined;
              return (
                <FragmentRows key={gk}>
                  {showGroup && (
                    <tr className="grp-row"><td className="ck-col"></td><td colSpan={vis.length + 1}>
                      <div className="grp-head">
                        <button className={`caret ${gopen ? "open" : ""}`} onClick={() => onToggleGroup(gk)} title="Collapse group"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg></button>
                        {groupBy === "epic" && (meta ? <span className={`grp-dot ${meta.c}`} /> : null)}
                        {groupBy === "sprint" && sprint && (sprint.st === "active" ? <span className="status info"><span className="d"></span>Active</span> : <span className="status ok"><span className="d"></span>Completed</span>)}
                        <b>{g.label}</b>
                        {groupBy === "sprint" && sprint && <span className="tiny muted mono">{sprint.start} – {sprint.end}</span>}
                        <span className="grp-cnt">{g.items.length} · {ptsTotal(g.items)}pts</span>
                        {(groupBy === "sprint" && sprint || (groupBy === "epic" && g.key !== "none")) && (
                          <>
                            <span className="grp-prog"><i style={{ width: `${prog}%` }} /></span>
                            <span className="tiny mono muted">{prog}%</span>
                          </>
                        )}
                        {groupBy === "epic" && g.key !== "none" && <button className="link grp-open" onClick={() => onOpen(g.key)}>Open epic</button>}
                      </div>
                    </td></tr>
                  )}
                  {gopen && g.items.map((t) => {
                    const hasSubs = subsOf(t.id).length > 0;
                    const open = expandedRows.has(t.id);
                    const sel = selected.has(t.id);
                    return (
                      <FragmentRows key={t.id}>
                        <tr className={sel ? "sel" : ""} onClick={(e) => { if ((e.target as HTMLElement).closest('input,button')) return; onOpen(String(t.id)); }}>
                          <td className="ck-col"><input type="checkbox" className="ck row-ck" checked={sel} onChange={(e) => onCheck(t.id, e.target.checked)} /></td>
                          {vis.map((c) => (
                            <td key={c.k}>
                              {c.k === "summary" ? (
                                <div className="sum-wrap">
                                  {hasSubs && <button className={`caret ${open ? "open" : ""}`} onClick={() => onToggleRow(t.id)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg></button>}
                                  <span className="title">{t.t}</span>
                                </div>
                              ) : cellContent(t, c.k)}
                            </td>
                          ))}
                          <td className="ck-col"><button className="row-open" onClick={() => onOpen(String(t.id))} title="Open"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7M9 7h8v8" /></svg></button></td>
                        </tr>
                        {open && subsOf(t.id).map((s, i) => {
                          const ssel = selected.has(s.id);
                          const last = i === subsOf(t.id).length - 1;
                          return (
                            <tr key={s.id} className={`sub-row-tr ${last ? "last-sub" : ""} ${ssel ? "sel" : ""}`} onClick={(e) => { if ((e.target as HTMLElement).closest('input,button')) return; onOpen(String(s.id)); }}>
                              <td className="ck-col"><input type="checkbox" className="ck row-ck" checked={ssel} onChange={(e) => onCheck(s.id, e.target.checked)} /></td>
                              {vis.map((c) => (
                                <td key={c.k} className={c.k === "summary" ? "sub-cell" : undefined}>
                                  {c.k === "summary" ? (
                                    <div className="sum-wrap sub-tree"><span className="title">{s.t}</span></div>
                                  ) : c.k === "sprint" ? null : cellContent(s, c.k)}
                                </td>
                              ))}
                              <td className="ck-col"><button className="row-open" onClick={() => onOpen(String(s.id))} title="Open"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7M9 7h8v8" /></svg></button></td>
                            </tr>
                          );
                        })}
                      </FragmentRows>
                    );
                  })}
                </FragmentRows>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

/** Wrapper so a group/parent can emit multiple <tr> without a wrapping node. */
function FragmentRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/* ============================ BACKLOG ============================ */
function Backlog(props: {
  filtered: TaskRow[];
  collapsedEpics: Set<string>;
  collapsedBlNodes: Set<number>;
  onToggleEpic: (id: string | number) => void;
  onToggleNode: (id: number) => void;
  onOpen: (id: string) => void;
}) {
  useTasksVersion();
  const { filtered, collapsedEpics, collapsedBlNodes, onToggleEpic, onToggleNode, onOpen } = props;
  const noEpic = filtered.filter((t) => !t.epic);

  return (
    <div className="bl-grid">
      <div className="bl-main">
        <div className="bl-sec">
          <div className="section-title"><h2>Epics</h2><span className="muted tiny">{filtered.length} issues · {ptsTotal(filtered)}pts</span></div>
          {filtered.length === 0 ? (
            <EmptyIssue title="No issues yet" desc="Plan ahead by adding issues here, then pull them into a sprint when ready." />
          ) : (
            <div className="bl-tree">
              {EPIC_IDS.map((eid) => { const e = taskById(eid); if (!e) return null; const ch = childrenOf(eid); if (!ch.length) return null; return <EpicNode key={eid} eid={eid} e={e} children={ch} collapsed={collapsedEpics.has(String(eid))} onToggle={() => onToggleEpic(eid)} collapsedBlNodes={collapsedBlNodes} onToggleNode={onToggleNode} onOpen={onOpen} />; })}
              {noEpic.length > 0 && (
                <NoEpicNode list={noEpic} collapsed={collapsedEpics.has("none")} onToggle={() => onToggleEpic("none")} collapsedBlNodes={collapsedBlNodes} onToggleNode={onToggleNode} onOpen={onOpen} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EpicNode({ eid, e, children, collapsed, onToggle, collapsedBlNodes, onToggleNode, onOpen }: {
  eid: number; e: TaskRow; children: TaskRow[]; collapsed: boolean; onToggle: () => void; collapsedBlNodes: Set<number>; onToggleNode: (id: number) => void; onOpen: (id: string) => void;
}) {
  const m = EPIC_META[eid] || { c: "m", own: "mk", goal: "" };
  const prog = progOf(children);
  return (
    <div className="bl-ep">
      <div className="bl-ep-h" onClick={() => onOpen(String(eid))}>
        <button className={`caret ${collapsed ? "" : "open"}`} onClick={(ev) => { ev.stopPropagation(); onToggle(); }} title="Collapse/expand"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg></button>
        <span className={`grp-dot ${m.c}`} />
        <b>{e.t}</b>
        <span className="grp-cnt">{children.length} issues · {ptsTotal(children)}pts</span>
        <span className="grp-prog"><i style={{ width: `${prog}%` }} /></span>
        <span className="tiny mono muted">{prog}%</span>
      </div>
      {!collapsed && (
        <div className="bl-ep-body">
          <ul className="bl-lvl">
            {children.map((c, i) => <BlIssueLi key={c.id} t={c} last={i === children.length - 1} collapsedBlNodes={collapsedBlNodes} onToggleNode={onToggleNode} onOpen={onOpen} />)}
          </ul>
        </div>
      )}
    </div>
  );
}

function NoEpicNode({ list, collapsed, onToggle, collapsedBlNodes, onToggleNode, onOpen }: {
  list: TaskRow[]; collapsed: boolean; onToggle: () => void; collapsedBlNodes: Set<number>; onToggleNode: (id: number) => void; onOpen: (id: string) => void;
}) {
  return (
    <div className="bl-ep">
      <div className="bl-ep-h">
        <button className={`caret ${collapsed ? "" : "open"}`} onClick={onToggle} title="Collapse/expand"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg></button>
        <span className="grp-dot m" /><b>No epic</b><span className="grp-cnt">{list.length} issues</span>
      </div>
      {!collapsed && (
        <div className="bl-ep-body">
          <ul className="bl-lvl">
            {list.map((t, i) => <BlIssueLi key={t.id} t={t} last={i === list.length - 1} collapsedBlNodes={collapsedBlNodes} onToggleNode={onToggleNode} onOpen={onOpen} />)}
          </ul>
        </div>
      )}
    </div>
  );
}

function BlIssueLi({ t, last, collapsedBlNodes, onToggleNode, onOpen }: {
  t: TaskRow; last: boolean; collapsedBlNodes: Set<number>; onToggleNode: (id: number) => void; onOpen: (id: string) => void;
}) {
  const subs = subsOf(t.id);
  const hasSubs = subs.length > 0;
  const nclosed = collapsedBlNodes.has(t.id);
  const sp = t.ty === "subtask" ? null : (t.sp ? <span className="tag i">{SPRINTS[t.sp].name}</span> : <span className="tiny faint">Backlog</span>);
  return (
    <li className={`bl-li ${last ? "last" : ""}`}>
      <div className="bl-nd" onClick={() => onOpen(String(t.id))}>
        {hasSubs ? (
          <button className={`caret sm ${nclosed ? "" : "open"}`} onClick={(ev) => { ev.stopPropagation(); onToggleNode(t.id); }} title="Collapse/expand"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg></button>
        ) : <span className="caret-sp" />}
        <span className="row-open"><TyIcon ty={t.ty} /></span>
        <span className="mono id">ATL-{t.id}</span>
        <span className="bl-r-t truncate">{t.t}</span>
        <span className="bl-nd-meta">{sp}<PrioBadge p={t.p} /><StatusBadge s={t.s} /><PtsPill pts={t.pts} /><AvKey id={t.a} size="sm" /></span>
      </div>
      {hasSubs && !nclosed && (
        <ul className="bl-lvl">
          {subs.map((s, i) => (
            <li key={s.id} className={`bl-li ${i === subs.length - 1 ? "last" : ""}`}>
              <div className="bl-nd" onClick={() => onOpen(String(s.id))}>
                <span className="caret-sp" />
                <span className="row-open"><TyIcon ty={s.ty} /></span>
                <span className="mono id">ATL-{s.id}</span>
                <span className="bl-r-t truncate">{s.t}</span>
                <span className="bl-nd-meta"><PrioBadge p={s.p} /><StatusBadge s={s.s} /><PtsPill pts={s.pts} /><AvKey id={s.a} size="sm" /></span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function EmptyIssue({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="empty">
      <div className="empty-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg></div>
      <b>{title}</b><p>{desc}</p>
    </div>
  );
}
