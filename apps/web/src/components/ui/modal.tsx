/** Modal — the one scaffold for centered dialogs: dimming backdrop plus
 *  overlay panel with header (title + close) and body. Previously
 *  hand-rolled six times with drifting close-button classes (`mh-x` vs `x`). */
import type { ReactNode } from "react";
import { CloseIcon } from "./icon";

export function Modal({
  title,
  onClose,
  children,
  width,
  className = "",
  headerExtra,
  /** Called when the backdrop itself (not the panel) is clicked.
   *  Defaults to onClose. */
  onBackdrop,
  /** Set false to render without the dimming backdrop scrim. */
  backdrop = true,
  backdropClassName = "",
  ...rest
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  className?: string;
  headerExtra?: ReactNode;
  onBackdrop?: () => void;
  backdrop?: boolean;
  backdropClassName?: string;
} & Record<string, unknown>) {
  return (
    <>
      {backdrop && (
        <div
          className={`scrim show ${backdropClassName}`.trim()}
          onClick={onBackdrop ?? onClose}
        />
      )}
      <div
      className={`modal show ${className}`.trim()}
      style={width ? { width } : undefined}
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
    </>
  );
}
