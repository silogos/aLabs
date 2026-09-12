"use client";

/** User notifications view — the full personal feed plus delivery
 *  preferences. Unread items are marked read on click; "Mark all read"
 *  clears the badge. Lean version of the dashboard NotificationsCard
 *  mapping (kinds → icons). */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { notificationsService } from "@/services/notifications";
import { qk } from "@/lib/query-keys";
import { timeAgo } from "@/lib/format";
import type { NotificationPreference } from "@pmin/core";
import type { ReactNode } from "react";

type NotifKind = "mention" | "assign" | "review" | "due" | "reply" | "invite" | "deadline";

const KIND: Record<string, NotifKind> = {
  mention: "mention",
  comment: "reply",
  assign: "assign",
  assignment: "assign",
  review: "review",
  due: "due",
  due_soon: "due",
  reply: "reply",
  invite: "invite",
  invitation: "invite",
  deadline: "deadline",
  milestone: "deadline",
};

const ICONS: Record<NotifKind, ReactNode> = {
  mention: (
    <svg viewBox="0,0,24,24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16,8v5a3,3,0,0,0,6,0v-1a10,10,0,1,0,-3.5,7.6" />
    </svg>
  ),
  assign: (
    <svg viewBox="0,0,24,24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="7" r="4" />
      <path d="M3,21v-2a4,4,0,0,1,4,-4h4a4,4,0,0,1,4,4v2" />
      <path d="M19,8v6M22,11h-6" />
    </svg>
  ),
  review: (
    <svg viewBox="0,0,24,24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12,22s8,-4,8,-10V5l-8,-3l-8,3v7c0,6,8,10,8,10z" />
      <path d="M9,12l2,2,4,-4" />
    </svg>
  ),
  due: (
    <svg viewBox="0,0,24,24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12,6v6l4,2" />
    </svg>
  ),
  reply: (
    <svg viewBox="0,0,24,24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9,14l-5,-5,5,-5" />
      <path d="M4,9h11a5,5,0,0,1,5,5v2" />
    </svg>
  ),
  invite: (
    <svg viewBox="0,0,24,24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3,7l9,6,9,-6M12,13v5M9,16h6" />
    </svg>
  ),
  deadline: (
    <svg viewBox="0,0,24,24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="13" r="8" />
      <path d="M5,3 L2,6M22,6l-3,-3M12,9v4l2,2" />
    </svg>
  ),
};

const PREF_META: Record<string, { title: string; sub: string }> = {
  assign: { title: "Task assignments", sub: "Someone assigns a task to you" },
  comment: { title: "Task comments", sub: "Someone comments on a task you follow" },
  invite: { title: "Workspace invitations", sub: "Someone invites you to join a workspace" },
};

export function NotificationsView() {
  const { toast } = useApp();
  const qc = useQueryClient();
  const { data: items } = useQuery({
    queryKey: qk.notifications(),
    queryFn: notificationsService.list,
  });
  const { data: prefs } = useQuery({
    queryKey: qk.notificationPreferences(),
    queryFn: notificationsService.preferences,
  });
  const list = items ?? [];
  const unread = list.filter((n) => !n.readAt).length;
  const inAppPrefs = (prefs ?? []).filter((p) => p.channel === "in_app");

  const refresh = () => qc.invalidateQueries({ queryKey: qk.notifications() });
  const refreshPrefs = () => qc.invalidateQueries({ queryKey: qk.notificationPreferences() });

  /** Optimistic toggle — rolled back from the server on failure. */
  const setPref = async (p: NotificationPreference, enabled: boolean) => {
    const next = { channel: p.channel, type: p.type, enabled };
    qc.setQueryData<NotificationPreference[]>(qk.notificationPreferences(), (cur) =>
      (cur ?? []).map((x) => (x.channel === next.channel && x.type === next.type ? next : x)),
    );
    try {
      await notificationsService.setPreference(next);
    } catch {
      await refreshPrefs();
      toast("Couldn't save preference");
    }
  };

  const markAll = async () => {
    if (unread === 0) return;
    try {
      await notificationsService.markAllRead();
      await refresh();
      toast("Marked all as read");
    } catch {
      toast("Couldn't mark as read");
    }
  };

  const markOne = async (id: string, readAt: string | null) => {
    if (readAt) return;
    try {
      await notificationsService.markRead(id);
      await refresh();
    } catch {
      toast("Couldn't mark as read");
    }
  };

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Notifications</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </div>
        </div>
      </div>

      <div className="stack" style={{ gap: 14 }}>
        <div className="card">
          <div className="panel-head">
            <h3>Inbox</h3>
            <span className="muted">{list.length} total</span>
            <div className="right">
              <button className="btn ghost sm" disabled={unread === 0} onClick={() => void markAll()}>
                Mark all read
              </button>
            </div>
          </div>
          <div className="panel-body flush">
            <div className="notif-list">
              {list.length === 0 && (
                <div className="muted tiny" style={{ padding: "14px" }}>No notifications yet.</div>
              )}
              {list.map((n) => {
                const kind = KIND[n.type] ?? "mention";
                return (
                  <div
                    key={n.id}
                    className={`notif-item ${n.readAt ? "read" : "unread"}`}
                    onClick={() => void markOne(n.id, n.readAt)}
                    style={{ cursor: n.readAt ? "default" : "pointer" }}
                  >
                    <span className="notif-dot" />
                    <span className={`notif-ic ${kind}`}>{ICONS[kind]}</span>
                    <div className="notif-body">
                      <b>{n.title}</b>
                      {n.body && <span className="quote">{n.body}</span>}
                    </div>
                    <span className="notif-time">{timeAgo(n.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card" data-od-id="notif-preferences">
          <div className="panel-head">
            <h3>Preferences</h3>
            <span className="muted">In-app</span>
          </div>
          <div className="panel-body flush">
            {inAppPrefs.map((p) => {
              const meta = PREF_META[p.type];
              return (
                <div key={p.type} className="pref-row">
                  <div className="pref-meta">
                    <b>{meta?.title ?? p.type}</b>
                    <span className="sub">{meta?.sub}</span>
                  </div>
                  <button
                    className={`tgl ${p.enabled ? "on" : ""}`}
                    aria-label={meta ? `Toggle ${meta.title.toLowerCase()}` : `Toggle ${p.type}`}
                    aria-pressed={p.enabled}
                    onClick={() => void setPref(p, !p.enabled)}
                  />
                </div>
              );
            })}
          </div>
          <div
            className="tiny faint"
            style={{ padding: "10px 14px", borderTop: "1px solid var(--border)" }}
          >
            Email delivery is coming soon — these toggles apply to in-app notifications only.
          </div>
        </div>
      </div>
    </section>
  );
}
