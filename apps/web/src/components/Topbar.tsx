/** Topbar — breadcrumb + sprint status + notifications. */
import { useApp } from "../store.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api.js";

export function Topbar({ title }: { title: string }) {
  const { project } = useApp();
  const { data: notifs } = useQuery({ queryKey: ["notifications"], queryFn: api.notifications });
  const unread = notifs?.filter((n) => !n.readAt).length ?? 0;

  return (
    <header className="topbar" data-od-id="topbar">
      <div className="tb-left">
        <span className="pico">{project?.icon ?? "A"}</span>
        <span className="proj-name">{project?.name ?? "Atlas Platform 2.0"}</span>
        <span className="sep">/</span>
        <span className="cur">{title}</span>
      </div>
      <div className="tb-right">
        <span className="status info"><span className="d"></span>Sprint 14 · 4d left</span>
        <button className="tbtn" data-od-id="notifications" title={`${unread} unread`}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          {unread > 0 && <span className="count">{unread}</span>}
        </button>
      </div>
    </header>
  );
}
