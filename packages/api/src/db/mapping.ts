/** Shared row→DTO mapping helpers used by every repo: Date serialization and
 *  the user-hydration pattern (repos embed `User` refs in members, pages,
 *  meetings, agreements, …). */
import type { User } from "@pmin/core";
import { getUsersByIds } from "./auth-repo";

/** Date | null | undefined → ISO string | null. */
export const iso = (d: Date | null | undefined): string | null => (d ? d.toISOString() : null);

/** Fetch the referenced users and index them by id — callers do
 *  `byId.get(row.userId) ?? null` to embed the ref. */
export async function userMap(
  ids: Array<string | null | undefined>,
): Promise<Map<string, User>> {
  const unique = [...new Set(ids.filter((x): x is string => !!x))];
  const users = unique.length ? await getUsersByIds(unique) : [];
  return new Map(users.map((u) => [u.id, u]));
}
