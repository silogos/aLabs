"use client";

/** ConfirmDialog — the one reusable confirmation dialog for destructive or
 *  irreversible actions, across all modules. Built on the shared Modal
 *  scaffold (.mb body + .mf footer). Supports an optional typed-name gate
 *  (requireText) for the highest-stakes actions, and a busy state while the
 *  mutation runs. Esc and backdrop close unless busy; the safe button is
 *  focused by default so Enter never confirms by accident. */
import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "./modal";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  busyLabel = "Working…",
  cancelLabel = "Cancel",
  /** Danger styles the confirm button red and is meant for destructive actions. */
  danger = false,
  /** Disables everything while the mutation is in flight. */
  busy = false,
  /** When set, the confirm button stays disabled until the user types this
   *  exact string (e.g. the org's name before deleting it). */
  requireText,
  onConfirm,
  onClose,
  width = 420,
  "data-od-id": odId,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  busyLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  requireText?: string;
  onConfirm: () => void;
  onClose: () => void;
  width?: number;
  "data-od-id"?: string;
}) {
  const [typed, setTyped] = useState("");

  // Reset the typed gate every time the dialog opens.
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  // Esc closes (unless a mutation is in flight).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const locked = requireText !== undefined && typed !== requireText;

  return (
    <>
      {/* Backdrop: dims the page and the drawer underneath; click closes. */}
      <div
        className="scrim show confirm"
        onClick={busy ? undefined : onClose}
        data-od-id={odId ? `${odId}-backdrop` : undefined}
      />
      <Modal
        title={title}
        onClose={busy ? () => {} : onClose}
        onBackdrop={busy ? undefined : onClose}
        width={width}
        className="confirm-dialog"
        data-od-id={odId}
      >
      <div className="mb" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {description != null && <div className="small">{description}</div>}
        {requireText !== undefined && (
          <input
            className="fld"
            autoFocus
            placeholder={requireText}
            value={typed}
            disabled={busy}
            onChange={(e) => setTyped(e.target.value)}
          />
        )}
      </div>
      <div className="mf">
        <button className="btn ghost" disabled={busy} onClick={onClose} autoFocus={!requireText}>
          {cancelLabel}
        </button>
        <button
          className={`btn ${danger ? "danger" : "primary"}`}
          disabled={locked || busy}
          onClick={onConfirm}
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
    </>
  );
}
