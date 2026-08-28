/** DatePicker — shared date entry for the app: a `.fld`-styled trigger that
 *  opens a react-day-picker calendar popover. Controlled "YYYY-MM-DD" string
 *  API so existing useState forms keep their shape; "" clears the selection. */
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { dateShort, toLocalDate } from "@/lib/format";

function CalIcon({ size =14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0,0,24,24" fill="none" aria-hidden className="dp-ico">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8,3v4M16,3v4M3,10h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function parseYmd(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return isNaN(+d) ? undefined : d;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  error,
  className = "",
  id,
  style,
  clearable =true,
}: {
  /** Selected date as "YYYY-MM-DD", or "" for none. */
  value: string;
  onChange: (value: string) => void;
  /** Minimum selectable date, "YYYY-MM-DD". */
  min?: string;
  /** Maximum selectable date, "YYYY-MM-DD". */
  max?: string;
  placeholder?: string;
  /** Shows the danger border (matches `.fld.err`). */
  error?: boolean;
  className?: string;
  id?: string;
  /** Applied to the wrapper so fixed widths/heights keep the popover anchored. */
  style?: React.CSSProperties;
  /** Allow clicking the selected day again to clear. */
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const minD = parseYmd(min ?? "");
  const maxD = parseYmd(max ?? "");
  const disabled = [
    ...(minD ? [{ before: minD }] : []),
    ...(maxD ? [{ after: maxD }] : []),
  ];
  const selected = parseYmd(value);

  return (
    <div className="dp-wrap" ref={ref} style={style}>
      <button
        type="button"
        id={id}
        className={`fld dp-trigger ${className}${error ? " err" : ""}${open ? " dp-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "" : "dp-ph"}>{value ? dateShort(value) : placeholder}</span>
        <CalIcon />
      </button>
      {open && (
        <div className="dp-pop" role="dialog" aria-label="Choose date">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (!d) return;
              const next = toLocalDate(d);
              if (clearable && value && next === value) onChange("");
              else onChange(next);
              setOpen(false);
            }}
            disabled={disabled}
            defaultMonth={selected ?? minD}
            startMonth={minD ? new Date(minD.getFullYear(), minD.getMonth(),1) : undefined}
            endMonth={maxD ? new Date(maxD.getFullYear(), maxD.getMonth(),1) : undefined}
          />
        </div>
      )}
    </div>
  );
}
