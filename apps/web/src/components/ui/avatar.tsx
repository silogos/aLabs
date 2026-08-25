/** Avatar — initials chip with a stable per-user color. */
import type { User } from "@pmin/core";

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AV_COLORS = ["a", "b", "c", "d", "e", "f"];
export function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length]!;
}

export function Avatar({
  user,
  size = "",
  name,
}: {
  user?: Pick<User, "id" | "name">;
  size?: "sm" | "lg" | "";
  name?: string;
}) {
  const label = name ?? user?.name ?? "?";
  const cls = user ? colorFor(user.id) : "b";
  return <span className={`av ${cls} ${size}`}>{initials(label)}</span>;
}
