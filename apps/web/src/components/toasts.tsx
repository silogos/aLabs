/** Toast stack. */
import { useApp } from "@/providers/app-provider";

export function Toasts() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
