"use client";
/** IconPicker — reusable entity-icon selector: a colored tile button that
 *  opens a popover grid of emoji icons. Shared by the org projects drawer
 *  (persists via projectUpdate), the new-project modal, and project settings.
 *  `onChange` receives the picked emoji, or null when "None" is chosen. */
import { useEffect, useRef, useState } from "react";

/** Curated icon set — project/domain-relevant emoji, all within the
 *  DB's varchar(20) `icon` column. */
export const PROJECT_ICONS = [
  "🚀", "📊", "📦", "🧭", "⚙️", "🛠️", "📱", "💻",
  "🌐", "🔒", "🎨", "📈", "💡", "🧪", "⚡", "🌍",
  "🏗️", "📋", "🗂️", "💰", "🎯", "🚢", "🧩", "📚",
  "🏢", "🌱", "🔥", "✨", "🧠", "🤖", "☁️", "🎬",
  "🎮", "☕", "🏭", "🛒", "❤️", "🗓️", "📮", "🏁",
];

export function IconPicker({
  value,
  fallback,
  color,
  size = 28,
  radius = 8,
  fontSize,
  disabled = false,
  onChange,
  title = "Change icon",
}: {
  /** Current icon (emoji string) — undefined/null falls back to `fallback`. */
  value?: string | null;
  /** Letter/text shown when no icon is set (e.g. project name initial). */
  fallback: string;
  /** Tile background color (deterministic entity color). */
  color: string;
  size?: number;
  radius?: number;
  fontSize?: number;
  disabled?: boolean;
  onChange?: (icon: string | null) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Outside click + Esc close the popover.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (icon: string | null) => {
    setOpen(false);
    onChange?.(icon);
  };

  return (
    <div className="ipick" ref={wrapRef}>
      <button
        type="button"
        className="pico"
        title={disabled ? undefined : title}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="grid"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          fontSize: fontSize ?? Math.round(size * 0.46),
          background: color,
          cursor: disabled ? "default" : "pointer",
        }}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        {value ?? fallback}
      </button>
      {open && (
        <div className="ipick-pop" role="grid" aria-label="Choose an icon">
          <div className="ipick-grid">
            {PROJECT_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                className={ic === value ? "on" : ""}
                aria-label={`Icon ${ic}`}
                onClick={() => pick(ic)}
              >
                {ic}
              </button>
            ))}
          </div>
          <div className="ipick-foot">
            <button type="button" onClick={() => pick(null)}>
              Use initial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
