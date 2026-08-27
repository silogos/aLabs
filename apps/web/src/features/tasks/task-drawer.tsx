/** Task detail drawer — two-column workspace (main + side panel) + epic mode.
 *  Reads from the board queries; entry via AppProvider.openTask(id). */
import { documentsService } from "@/services/documents";
import { DatePicker } from "@/components/ui/date-picker";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/providers/app-provider";
import { usePeople } from "@/providers/people-provider";
import { useBoard, useTaskDetail } from "./queries";
import { useTaskActions } from "./mutations";
import { PRIO, PRIO_ORDER, ST, progOf, ptsTotal, type RelKey, type TaskRow } from "./model";
import { TyIcon, TyTag, AvKey, StatusBadge, PrioBadge, PtsPill } from "./tasks-ui";
import { RichTextEditor } from "@pmin/editor";
import type { Content } from "@pmin/core";
import { taskSerial } from "@/lib/serial";
import { timeAgo } from "@/lib/format";

export function TaskDrawer({ id }: { id: string }) {
  const board = useBoard();
  const { setField } = useTaskActions();
  const { closeTask, toast, openTask, openRelPicker, project } = useApp();
  const tid = Number(id);
  const t = board.taskById(tid);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (titleRef.current && t) titleRef.current.textContent = t.t;
  }, [tid]);

  if (!t) {
    return (
      <aside className="drawer show">
        <div className="db">Loading…</div>
      </aside>
    );
  }

  return (
    <aside className="drawer workspace show">
      <div className="dh">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="dh-top">
            {t.ty === "epic" ? <span className="tag o">Epic</span> : <TyTag ty={t.ty} />}
            <span className="tid">
              {t.ty === "epic" ? `EPIC · ${taskSerial(t.id)}` : `${taskSerial(t.id)}`}
            </span>
          </div>
          <h3
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            title="Click to edit the title"
            onBlur={() => {
              const v = titleRef.current?.textContent?.trim() ?? "";
              if (v && v !== t.t) {
                setField(t.id, "t", v);
                toast("Title updated");
              } else if (!v && titleRef.current) titleRef.current.textContent = t.t;
            }}            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          />
        </div>
        <button className="x" onClick={closeTask}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="db" id="drawer-body">
        {t.ty === "epic" ? (
          <EpicDetail e={t} onOpen={openTask} />
        ) : (
          <TaskDetail
            t={t}
            onOpen={openTask}
            toast={toast}
            openRelPicker={openRelPicker}
            pid={project!.id}
          />
        )}
      </div>
    </aside>
  );
}

/* ============================ TASK DETAIL ============================ */
function TaskDetail({
  t,
  onOpen,
  toast,
  openRelPicker,
  pid,
}: {
  t: TaskRow;
  onOpen: (id: string) => void;
  toast: (m: string) => void;
  openRelPicker: (id: string) => void;
  pid: string;
}) {
  const board = useBoard();
  const people = usePeople();
  const { setField, toggleSubDone, addSubtask, addComment, removeRelationship } = useTaskActions();
  const detail = useTaskDetail(t.uuid);
  const [cmt, setCmt] = useState("");
  const descTimer = useRef<number | undefined>(undefined);
  const onDescChange = (doc: Content) => {
    window.clearTimeout(descTimer.current);
    descTimer.current = window.setTimeout(() => {
      setField(t.id, "desc", doc);
      toast("Description saved");
    }, 600);
  };
  const rep = people.personOf(t.rep);

  const upd = (key: string, value: unknown, label: string) => {
    setField(t.id, key, value);
    toast(label);
  };

  const relRows: { label: string; id?: number; static?: string }[] = [];
  if (t.parent) relRows.push({ label: "Parent", id: t.parent });
  if (t.epic) relRows.push({ label: "Epic", id: t.epic });
  const subs = board.subsOf(t.id);
  if (t.ty !== "subtask" && subs.length)
    relRows.push({ label: "Subtasks", static: `${subs.length} — listed above` });
  const rel = t.rel;
  const relGroups: { key: RelKey; label: string; items: number[] }[] = [
    { key: "blockedBy", label: "Blocked by", items: rel?.blockedBy ?? [] },
    { key: "blocks", label: "Blocks", items: rel?.blocks ?? [] },
    { key: "relates", label: "Relates to", items: rel?.relates ?? [] },
  ];
  const comments = detail.data?.comments ?? [];

  return (
    <div className="dw-grid">
      <div className="dw-main">
        <Section title="Description">
          <RichTextEditor
            key={t.id}
            className="dw-desc"
            initialContent={t.desc}
            placeholder="Add a description… what does this issue need to do?"
            onChange={onDescChange}
            onOpenTask={(id) => onOpen(String(id))}
            uploadFile={(file) => documentsService.uploadFile(pid, file)}
          />
        </Section>

        {(t.ty === "story" || t.ty === "task" || t.ty === "bug") && (
          <Section title="Acceptance criteria" meta="0/0">
            <p className="muted tiny">No acceptance criteria yet.</p>
          </Section>
        )}

        <Section
          title="Subtasks"
          meta={`${subs.filter((s) => s.s === "done").length}/${subs.length}`}
          action={{
            label: "+ Add",
            onClick: () => {
              addSubtask(t.id);
              toast("Subtask added");
            },
          }}
        >
          {subs.length ? (
            <ul className="sub-list">
              {subs.map((s) => (
                <li className="sub-item" key={s.id}>
                  <span className="sub-grip">⋮⋮</span>
                  <input
                    type="checkbox"
                    className="ck"
                    checked={s.s === "done"}
                    onChange={() => {
                      toggleSubDone(s.id);
                      toast(`${taskSerial(s.id)} ${s.s === "done" ? "reopened" : "completed"}`);
                    }}
                  />
                  <button className="sub-open" onClick={() => onOpen(String(s.id))}>
                    <TyIcon ty={s.ty} size={12} />
                  </button>
                  <div className="sub-body">
                    <a
                      className={`sub-title ${s.s === "done" ? "done" : ""}`}
                      onClick={() => onOpen(String(s.id))}
                    >
                      {s.t}
                    </a>
                    <span className="sub-meta mono">{taskSerial(s.id)}</span>
                  </div>
                  <span className="sub-side">
                    <StatusBadge s={s.s} />
                    <AvKey id={s.a} size="sm" />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted tiny">No subtasks. Break this down into smaller pieces.</p>
          )}
        </Section>

        {t.ty !== "subtask" && (
          <Section
            title="Relationships"
            action={{ label: "+ Add link", onClick: () => openRelPicker(String(t.id)) }}
          >
            {relRows.length || relGroups.some((g) => g.items.length) ? (
              <div className="dw-rel">
                {relRows.map((r, i) => {
                  const c = r.id ? board.taskById(r.id) : undefined;
                  return (
                    <div className="dw-rel-row" key={`ro-${i}`}>
                      <span className="dw-rel-k">{r.label}</span>
                      {c ? (
                        <a className="dw-rel-v" onClick={() => onOpen(String(c.id))}>
                          <TyIcon ty={c.ty} size={12} /> {taskSerial(c.id)} · {c.t}
                        </a>
                      ) : (
                        <span className="dw-rel-v static">{r.static}</span>
                      )}
                    </div>
                  );
                })}
                {relGroups
                  .filter((g) => g.items.length)
                  .map((g) => (
                    <div className="dw-rel-row dw-rel-multi" key={g.key}>
                      <span className="dw-rel-k">
                        {g.label} <span className="muted tiny">{g.items.length}</span>
                      </span>
                      <div className="dw-rel-list">
                        {g.items.map((oid) => {
                          const c = board.taskById(oid);
                          if (!c) return null;
                          return (
                            <div className="dw-rel-li" key={oid}>
                              <a className="dw-rel-v" onClick={() => onOpen(String(c.id))}>
                                <TyIcon ty={c.ty} size={12} /> {taskSerial(c.id)} · {c.t}
                              </a>
                              <button
                                className="rel-x"
                                title="Remove link"
                                onClick={() => {
                                  removeRelationship(t.id, g.key, oid);
                                  toast("Link removed");
                                }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                >
                                  <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="rel-empty">
                <span className="muted tiny">No links yet.</span>
                <button className="link sm" onClick={() => openRelPicker(String(t.id))}>
                  + Add link
                </button>
              </div>
            )}
          </Section>
        )}

        <Section title={`Comments · ${comments.length}`}>
          {comments.length ? (
            <div className="cmt-list">
              {comments.map((m) => (
                <div className="comment" key={m.id}>
                  <AvKey id={m.userId} />
                  <div>
                    <b>{people.who(m.userId)}</b>
                    <span className="when">{timeAgo(m.createdAt)}</span>
                    <p>{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted tiny">No comments yet.</p>
          )}
          <div className="cmt-box">
            <AvKey id={t.a} />
            <input
              className="cmt-in"
              placeholder="Add a comment…"
              value={cmt}
              onChange={(e) => setCmt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cmt.trim()) {
                  addComment(t.uuid!, cmt.trim());
                  setCmt("");
                }
              }}
            />
          </div>
        </Section>

        <Section
          title="Attachments · 0"
          action={{ label: "+ Upload", onClick: () => toast("Upload attachment — coming soon") }}
        >
          <p className="muted tiny">No attachments.</p>
        </Section>

        <Section title="Activity">
          <ul className="act-list">
            <li>
              <span className="act-d" />
              <div>
                <b>{people.who(t.rep)}</b> created this{" "}
                <span className="muted">· {t.desc ? "earlier" : "recently"}</span>
              </div>
            </li>
            <li>
              <span className="act-d" />
              <div>
                <b>{people.who(t.a)}</b> was assigned <span className="muted">· recently</span>
              </div>
            </li>
            <li>
              <span className="act-d" />
              <div>
                Status set to <b>{ST[t.s][0]}</b> <span className="muted">· recently</span>
              </div>
            </li>
          </ul>
        </Section>
      </div>

      <aside className="dw-side">
        <div className="sp-card">
          <SpSelect
            k="Status"
            value={t.s}
            options={["backlog", "todo", "progress", "review", "done"].map(
              (s) => [s, ST[s as keyof typeof ST][0]] as [string, string],
            )}
            onChange={(v) => upd("s", v, "Updated")}
          />
          <SpSelect
            k="Assignee"
            value={t.a}
            options={[["", "Unassigned"], ...people.options()]}
            onChange={(v) => upd("a", v, "Updated")}
          />
          <div className="sp-row">
            <span className="sp-k">Reporter</span>
            <div className="sp-v">
              <span className="sp-who">
                <AvKey id={t.rep} size="sm" /> {rep ? rep.name : "—"}
              </span>
            </div>
          </div>
          <SpSelect
            k="Priority"
            value={t.p}
            options={PRIO_ORDER.map((k) => [k, PRIO[k]] as [string, string])}
            onChange={(v) => upd("p", v, "Updated")}
          />
          {t.ty !== "subtask" ? (
            <SpSelect
              k="Sprint"
              value={t.sp || ""}
              options={[
                ["", "Backlog"],
                ...board.sprintIds.map((k) => [k, board.sprints[k]!.name] as [string, string]),
              ]}
              onChange={(v) => upd("sp", v || null, "Updated")}
            />
          ) : (
            <div className="sp-row">
              <span className="sp-k">Sprint</span>
              <div className="sp-v">
                <span className="muted tiny">Inherited</span>
              </div>
            </div>
          )}
          {t.ty !== "subtask" && (
            <SpSelect
              k="Epic"
              value={t.epic ? String(t.epic) : ""}
              options={[
                ["", "None"],
                ...board.epicIds
                  .filter((e) => board.taskById(e))
                  .map((e) => [String(e), board.taskById(e)!.t] as [string, string]),
              ]}
              onChange={(v) => upd("epic", v ? Number(v) : undefined, "Updated")}
            />
          )}
          <div className="sp-row">
            <span className="sp-k">Labels</span>
            <div className="sp-v">
              {(t.lb || []).length ? (
                (t.lb || []).map((l) => (
                  <span className="tag" key={l}>
                    {l}
                  </span>
                ))
              ) : (
                <span className="muted tiny">None</span>
              )}
            </div>
          </div>
          <div className="sp-row">
            <span className="sp-k">Story points</span>
            <div className="sp-v">
              <input
                className="sp-num"
                type="number"
                min={0}
                value={t.pts || 0}
                onChange={(e) => upd("pts", Number(e.target.value), "Updated")}
              />
            </div>
          </div>
          <div className="sp-row">
            <span className="sp-k">Due date</span>
            <div className="sp-v">
              <DatePicker
                value={t.dueIso ?? ""}
                onChange={(v) => upd("due", v, "Updated")}
                placeholder="—"
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SpSelect({
  k,
  value,
  options,
  onChange,
}: {
  k: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div className="sp-row">
      <span className="sp-k">{k}</span>
      <div className="sp-v">
        <select className="sp-sel" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Section({
  title,
  meta,
  action,
  children,
}: {
  title: string;
  meta?: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <section className="dw-sec">
      <div className="dw-sec-h">
        <h4>{title}</h4>
        {meta && <span className="muted tiny">{meta}</span>}
        {action && (
          <button className="link sm" style={{ marginLeft: "auto" }} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

/* ============================ EPIC DETAIL ============================ */
function EpicDetail({ e, onOpen }: { e: TaskRow; onOpen: (id: string) => void }) {
  const board = useBoard();
  const people = usePeople();
  const m = board.epicMeta[e.id] || { c: "o", own: "", goal: "" };
  const children = board.childrenOf(e.id);
  const prog = progOf(children);
  const done = children.filter((c) => c.s === "done").length;
  const activeStart =
    board.sprints[board.sprintIds.find((k) => board.sprints[k]?.st === "active") ?? ""]?.start;
  return (
    <div className="epic-detail">
      <div className="epic-head">
        <div className="epic-goal">
          {e.t} — {m.goal}
        </div>
        <div className="epic-owner">
          <AvKey id={m.own} />
          <span>
            <b>{people.who(m.own)}</b> <span className="muted tiny">· owner</span>
          </span>
          <StatusBadge s={e.s} />
        </div>
      </div>
      <div className="epic-prog">
        <div className={`epic-prog-bar ${m.c}`}>
          <i style={{ width: `${prog}%` }} />
        </div>
        <div className="epic-prog-meta">
          <b className="mono">{prog}%</b>
          <span className="muted tiny">
            {done}/{children.length} issues done · {ptsTotal(children)} pts total
          </span>
        </div>
      </div>
      <div className="epic-tl">
        <span className="tiny muted">
          Timeline · {activeStart ?? "—"} → {e.due}
        </span>
      </div>
      <Section title="Child issues" meta={String(children.length)}>
        {children.length ? (
          <div className="epic-kids">
            {children.map((c) => (
              <a className="kid-row" key={c.id} onClick={() => onOpen(String(c.id))}>
                <TyIcon ty={c.ty} />
                <span className="mono id">{taskSerial(c.id)}</span>
                <span className="kid-t truncate">{c.t}</span>
                <StatusBadge s={c.s} />
                <PrioBadge p={c.p} />
                <PtsPill pts={c.pts} />
                <AvKey id={c.a} size="sm" />
              </a>
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-ic">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="4" y="4" width="16" height="16" rx="2.5" />
                <path d="m8.5 12 2.5 2.5 4.5-5" />
              </svg>
            </div>
            <b>No child issues</b>
            <p>Add stories, tasks or bugs under this epic.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
