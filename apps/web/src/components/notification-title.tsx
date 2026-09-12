"use client";

/** Notification title with inline entity links — renders the API's title
 *  segments; spans carrying a target become links (actor → members page,
 *  task text → task). Falls back to the plain title when there are no
 *  segments. Entity clicks stop propagation so the whole-item handler
 *  doesn't double-navigate; `href` keeps middle/cmd-click native. */
import type { NotificationTitleSegment } from "@pmin/core";
import { notificationPath } from "@/lib/notification-path";

export function NotificationTitle({
  segments,
  title,
  onOpen,
}: {
  segments: NotificationTitleSegment[] | null | undefined;
  title: string;
  onOpen: (path: string) => void;
}) {
  const spans = segments ?? [{ text: title }];
  return (
    <>
      {spans.map((seg, i) => {
        const path = seg.target ? notificationPath(seg.target) : null;
        if (!path) return <span key={i}>{seg.text}</span>;
        return (
          <a
            key={i}
            className="notif-link"
            href={path}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen(path);
            }}
          >
            {seg.text}
          </a>
        );
      })}
    </>
  );
}
