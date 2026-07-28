/** Task detail drawer — meta, subtasks, comments, status change. */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Comment } from "../api.js";
import { useApp } from "../store.js";
import { Avatar, Prio, StatusPill, TypeTag, colorFor, dueLabel, initials, taskSerial, timeAgo } from "./ui.js";
import type { Task, TaskStatus } from "@pmin/core";

export function TaskDrawer({ id }: { id: string }) {
  const { project, org, closeTask, toast } = useApp();
  const pid = project!.id;
  const qc = useQueryClient();
  const { data: task } = useQuery({ queryKey: ["task", id], queryFn: () => api.task(pid, id) });
  const { data: statuses } = useQuery({ queryKey: ["statuses", pid], queryFn: () => api.statuses(pid) });
  const { data: members } = useQuery({
    queryKey: ["members", org?.id],
    queryFn: () => api.members(org!.id),
    enabled: !!org,
  });

  const users = (members ?? []).map((m) => m.user);
  const userById = (uid: string | null) => users.find((u) => u.id === uid);
  const typeName = (t: Task) => {
    // types not embedded on task; infer from labels heuristically is unsafe — omit
    return null;
  };

  const move = async (status: TaskStatus) => {
    if (!task) return;
    await api.updateTask(pid, id, { statusId: status.id });
    qc.invalidateQueries({ queryKey: ["task", id] });
    qc.invalidateQueries({ queryKey: ["tasks", pid] });
    qc.invalidateQueries({ queryKey: ["dashboard", pid] });
    toast(`ATL → ${status.name}`);
  };

  if (!task) return <aside className="drawer show"><div className="db">Loading…</div></aside>;
  const assignee = userById(task.assigneeId);
  const status = statuses?.find((s) => s.id === task.statusId);

  return (
    <aside className="drawer show">
      <div className="dh">
        <div style={{ flex: 1 }}>
          <div className="tid">{taskSerial(task.order)}</div>
          <h3>{task.title}</h3>
        </div>
        <button className="x" onClick={closeTask}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="db">
        <div className="meta-grid" style={{ marginBottom: 18 }}>
          <span className="k">Status</span>
          <span className="v">
            {status ? (
              <select
                value={status.id}
                onChange={(e) => {
                  const s = statuses?.find((x) => x.id === e.target.value);
                  if (s) move(s);
                }}
                style={{ ...selectStyle, fontWeight: 600 }}
              >
                {(statuses ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <StatusPill name="—" />
            )}
          </span>
          <span className="k">Assignee</span>
          <span className="v">
            {assignee ? (
              <>
                <span className={`av ${colorFor(assignee.id)}`}>{initials(assignee.name)}</span>
                {assignee.name}
              </>
            ) : (
              <span className="muted">Unassigned</span>
            )}
          </span>
          <span className="k">Priority</span>
          <span className="v">
            <Prio priority={task.priority} />
          </span>
          <span className="k">Due date</span>
          <span className="v mono">{dueLabel(task.dueDate) || "—"}</span>
          <span className="k">Estimate</span>
          <span className="v mono">{task.estimate ? `${task.estimate} pts` : "—"}</span>
          {task.labels.length > 0 && (
            <>
              <span className="k">Labels</span>
              <span className="v">
                {task.labels.map((l) => (
                  <span className="tag" key={l.id}>
                    {l.name}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>

        <div className="section-title" style={{ margin: "6px 0 8px" }}>
          <h2>Description</h2>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
          {task.description ?? defaultDescription(task.title)}
        </p>

        {task.subtasks.length > 0 && (
          <>
            <div className="section-title" style={{ margin: "18px 0 4px" }}>
              <h2>Subtasks</h2>
              <span className="muted tiny" style={{ marginLeft: "auto" }}>
                {task.subtasks.filter((s) => isDone(s, statuses)).length}/{task.subtasks.length}
              </span>
            </div>
            {task.subtasks.map((s) => (
              <div className="sub-row" key={s.id}>
                <input type="checkbox" className="ck" defaultChecked={isDone(s, statuses)} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12.5,
                    color: isDone(s, statuses) ? "var(--muted)" : "var(--fg)",
                    textDecoration: isDone(s, statuses) ? "line-through" : "none",
                  }}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </>
        )}

        <div className="section-title" style={{ margin: "18px 0 4px" }}>
          <h2>Comments · {task.comments.length}</h2>
        </div>
        {task.comments.length === 0 ? (
          <p className="muted tiny">No comments yet.</p>
        ) : (
          task.comments.map((c: Comment) => {
            const u = userById(c.userId);
            return (
              <div className="comment" key={c.id}>
                {u ? <span className={`av ${colorFor(u.id)}`}>{initials(u.name)}</span> : <span className="av b">?</span>}
                <div>
                  <b>{u?.name ?? "Someone"}</b>
                  <span className="when">{timeAgo(c.createdAt)}</span>
                  <p>{c.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="df">
        <button className="btn subtle sm" style={{ width: "100%" }}>
          Comment
        </button>
        <button className="btn subtle sm" style={{ width: "100%" }}>
          Attach
        </button>
        <button className="btn primary sm" style={{ width: "100%" }} onClick={closeTask}>
          Done
        </button>
      </div>
    </aside>
  );
}

function serial(_t: Task): string {
  return "";
}
function isDone(s: Task, statuses?: TaskStatus[]) {
  const done = statuses?.find((x) => x.name === "Done");
  return !!done && s.statusId === done.id;
}
function defaultDescription(title: string) {
  return `Work item: ${title}. Acceptance criteria and implementation notes live here. Coordinate with the assignee; link related documents from the Documents module.`;
}
const selectStyle: React.CSSProperties = {
  height: 30,
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "0 9px",
  background: "var(--surface)",
  color: "var(--fg)",
  fontSize: 12.5,
};
