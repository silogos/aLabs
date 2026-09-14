"use client";

/** DrawerKit — the shared right-side drawer as composable pieces, so each
 *  surface (task, project, member) keeps its identity and actions without
 *  re-deriving the shell:
 *
 *    <Drawer label onClose>                    portal + scrim + aside
 *      <DrawerHeader>                          .dh row
 *        <DrawerTitle>…identity…</DrawerTitle>  .dh-main
 *        <DrawerMenu label>                    .hacts — three-dot menu
 *          <button role="menuitem">…</button>  menu-pop items
 *        </DrawerMenu>
 *      </DrawerHeader>
 *      <div className="db">…body…</div>
 *    </Drawer>
 *
 *  Pieces share state through DrawerContext (close handler + menu open
 *  state). Menu state is internal by default; pass `menuOpen`/`onMenuOpen`
 *  to Drawer to control it (e.g. reset it while the drawer stays mounted).
 *  `withScrim={false}` when the surrounding shell already dims (the project
 *  shell does it for the task drawer); `variant="workspace"` is the wide
 *  two-column task drawer. Drawers with no menu actions render DrawerMenu
 *  without children — the close button still shows. */
import { createPortal } from "react-dom";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface DrawerCtx {
  onClose: () => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}

export const DrawerContext = createContext<DrawerCtx | null>(null);

/** Drawer piece state — for custom header pieces alongside the kit. */
export function useDrawer(): DrawerCtx {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used inside <Drawer>");
  return ctx;
}

export function Drawer({
  label,
  variant = "",
  onClose,
  menuOpen: menuOpenProp,
  onMenuOpen,
  withScrim = true,
  children,
}: {
  /** dialog aria-label */
  label: string;
  /** "workspace" = the wide two-column task drawer */
  variant?: "" | "workspace";
  onClose: () => void;
  /** controlled menu state — internal when omitted */
  menuOpen?: boolean;
  onMenuOpen?: (v: boolean) => void;
  /** false when the shell already renders the dim */
  withScrim?: boolean;
  children: ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const menuOpen = menuOpenProp ?? internalOpen;
  const setMenuOpen = (v: boolean) => {
    setInternalOpen(v);
    onMenuOpen?.(v);
  };

  // Escape closes the menu first (the surrounding shells close the drawer
  // itself — the project shell's handler owns that)
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInternalOpen(false);
        onMenuOpen?.(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, onMenuOpen]);

  return createPortal(
    <DrawerContext.Provider value={{ onClose, menuOpen, setMenuOpen }}>
      {withScrim && <div className="scrim show" onClick={onClose} />}
      <aside className={`drawer ${variant} show`} role="dialog" aria-label={label}>
        {children}
      </aside>
    </DrawerContext.Provider>,
    document.body,
  );
}

/** Header row — title/identity pieces plus the actions cluster. */
export function DrawerHeader({ children }: { children: ReactNode }) {
  return <div className="dh">{children}</div>;
}

/** Identity block — everything left of the actions (.dh-main). */
export function DrawerTitle({ children }: { children: ReactNode }) {
  return <div className="dh-main">{children}</div>;
}

/** Actions cluster (.hacts): the three-dot menu when children are given,
 *  plus the close button. `label`/`disabled` shape the three-dot button.
 *  Items are DrawerMenuItems (a bare <div className="sep" /> still works
 *  as a divider). */
export function DrawerMenu({
  label = "Actions",
  disabled = false,
  children,
}: {
  label?: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const { onClose, menuOpen, setMenuOpen } = useDrawer();
  return (
    <div className="hacts">
      {children !== undefined && (
        <div className="hmenu">
          <button
            className="x"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
          {menuOpen && (
            <div className="menu-pop down" role="menu">
              {children}
            </div>
          )}
        </div>
      )}
      <button className="x" onClick={onClose} aria-label="Close" title="Close (Esc)">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/** One action in the DrawerMenu pop — closes the menu, then runs onClick,
 *  so callers never wire menu state themselves. */
export function DrawerMenuItem({
  onClick,
  icon,
  danger = false,
  disabled = false,
  children,
}: {
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const { setMenuOpen } = useDrawer();
  return (
    <button
      role="menuitem"
      className={danger ? "danger" : undefined}
      disabled={disabled}
      onClick={() => {
        setMenuOpen(false);
        onClick?.();
      }}
    >
      {icon}
      {children}
    </button>
  );
}
