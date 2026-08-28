/** Modal — the one scaffold for centered dialogs: scrim-less overlay panel
 *  with header (title + close) and body. Previously hand-rolled six times
 *  with drifting close-button classes (`mh-x` vs `x`). */
import type { ReactNode } from "react";
import { CloseIcon } from "./icon";

export function Modal({
  title,
  onClose,
  children,
  width,
  className = "",
  headerExtra,
  /** Called when the backdrop itself (not the panel) is clicked. */
  onBackdrop,
  ...rest
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  className?: string;
  headerExtra?: ReactNode;
  onBackdrop?: () => void;
} & Record<string, unknown>) {
  return (
    <div
      className={`modal show ${className}`.trim()}
      style={width ? { width } : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdrop?.();
        // Panel clicks must not bubble to a wrapping .scrim (which closes on
        // any bubbled click — planning's sprint/milestone modals rely on this).
        e.stopPropagation();
      }}
      {...rest}
    >
      <div className="mh">
        <h3>{title}</h3>
        {headerExtra}
        <button className="x" onClick={onClose} title="Close" aria-label="Close">
          <CloseIcon size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}
