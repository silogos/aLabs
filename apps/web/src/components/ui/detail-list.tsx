/** DetailList / DetailItem — the shared label/value rows for drawer and
 *  profile bodies. One details style everywhere: muted label left, value
 *  right — values can be plain text, chips/pills, or interactive controls
 *  (selects, pickers, inputs). */
import type { ReactNode } from "react";

export function DetailList({ children }: { children: ReactNode }) {
  return <div className="detail-list">{children}</div>;
}

export function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="detail-item">
      <span className="k">{label}</span>
      <div className="v">{children}</div>
    </div>
  );
}
