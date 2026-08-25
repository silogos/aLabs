/** Shared presentational bits for the Tasks module — mirror designs/app/alabs-app.html markup. */
import type { PrioId, StatusId, TypeId } from "./store";
import { ST, TY, taskById, who, personOf } from "./store";

export function TyIcon({ ty, size = 13 }: { ty: TypeId; size?: number }) {
  const m = TY[ty] ?? TY.task;
  return (
    <span className={`ty-ic ${m.c}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        dangerouslySetInnerHTML={{ __html: m.ic }}
      />
    </span>
  );
}

export function TyTag({ ty }: { ty: TypeId }) {
  const m = TY[ty] ?? TY.task;
  return <span className={`tag ${m.c}`}>{m.l}</span>;
}

export function AvKey({ id, size = "" }: { id: string; size?: "sm" | "" }) {
  const p = personOf(id);
  if (!p) return <span className={`av b ${size}`}>?</span>;
  return <span className={`av ${p.color} ${size}`}>{p.initials}</span>;
}

export function StatusBadge({ s }: { s: StatusId }) {
  const st = ST[s] ?? ["", "neutral"];
  return (
    <span className={`status ${st[1]}`}>
      <span className="d"></span>
      {st[0]}
    </span>
  );
}

export function PrioBadge({ p }: { p: PrioId }) {
  // label + class pulled from the shared .prio styles via the mock key
  const labels: Record<PrioId, string> = { p1: "Urgent", p2: "High", p3: "Medium", p4: "Low" };
  return (
    <span className={`prio ${p}`}>
      <span className="bars">
        <i></i>
        <i></i>
        <i></i>
      </span>
      {labels[p]}
    </span>
  );
}

export function PtsPill({ pts }: { pts: number }) {
  if (!pts) return null;
  return <span className="pts-pill">{pts}</span>;
}

export function EpicChip({ epic, onJump }: { epic: number; onJump?: (id: number) => void }) {
  const e = taskById(epic);
  if (!e) return null;
  return (
    <span className={`epic-chip ${cForEpic(epic)}`} title={e.t} onClick={() => onJump?.(epic)}>
      {e.t}
    </span>
  );
}

function cForEpic(epic: number): string {
  const META: Record<number, string> = { 200: "v", 201: "g", 202: "b", 203: "o" };
  return META[epic] ?? "o";
}

export { who };
