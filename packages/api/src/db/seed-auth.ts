/** Auth seed — inserts the 6 demo Northwind users + credential accounts
 *  (password "password123") into Postgres when the users table is empty.
 *  Returns the users in stable order for the in-memory seed to embed.
 *
 *  Concurrent-boot safe: inserts are conflict-nothing (a second boot module
 *  instance racing the first converges on the same rows), and any
 *  already-populated database (a real signup, another seeder) is left alone. */
import type { User } from "@pmin/core";
import * as authRepo from "./auth-repo";
import { hashPassword } from "../lib/passwords";

const DEMO_USERS: { name: string; email: string }[] = [
  { name: "Aisha Yusuf", email: "aisha@northwind.io" },
  { name: "Marco Keller", email: "marco@northwind.io" },
  { name: "Lin Chen", email: "lin@northwind.io" },
  { name: "Diego Pereira", email: "diego@northwind.io" },
  { name: "Sara Reinhardt", email: "sara@northwind.io" },
  { name: "Jonas Berg", email: "jonas@northwind.io" },
];

const DEMO_PASSWORD = "password123";

export async function seedAuth(): Promise<User[]> {
  const existing = await authRepo.listUsers();
  if (existing.length > 0) return existing;

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  for (const d of DEMO_USERS) {
    const user = await authRepo.insertUserIfAbsent({ ...d, emailVerified: true });
    await authRepo.insertAccountIfAbsent({ userId: user.id, provider: "credential", passwordHash });
  }
  return authRepo.listUsers();
}
