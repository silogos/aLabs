/** Date/time display formatters — the single home for every format helper
 *  (previously duplicated across five views). */

/** Human "time ago" from an ISO string. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

/** "Mar 24" from an ISO string or plain yyyy-mm-dd; "" when null/invalid. */
export function dateShort(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  if (isNaN(+d)) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "14:30" from an ISO datetime. */
export function timeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** "Mar 24 · 14:30" from an ISO datetime. */
export function dateTime(iso: string): string {
  return `${dateShort(iso)} · ${timeShort(iso)}`;
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

/** yyyy-mm-dd in local time — for <input type="date"> values. */
export function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
