/** Auth repository — Postgres (Drizzle) implementation for users, sessions,
 *  accounts, and password resets. Domain shapes stay zod-inferred from
 *  @pmin/core (ISO date strings, camelCase); rows are mapped here. */
import { and, asc, eq, gt, inArray, isNull } from "drizzle-orm";
import { db } from "./pg";
import {
  users,
  sessions,
  authAccounts,
  passwordResets,
  organizations,
  roles,
  organizationMembers,
} from "@pmin/core/db";
import { uuidv7, type User } from "@pmin/core";
import { ApiError } from "../lib/errors";

type UserRow = typeof users.$inferSelect;

const toUser = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  image: r.image,
  emailVerified: r.emailVerified,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

/* ---------------- users ---------------- */

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return row ? toUser(row) : null;
};

/** Demo/insertion order — uuid v7 is time-ordered, so id ASC ≈ signup order. */
export const listUsers = async (): Promise<User[]> => {
  const rows = await db.select().from(users).orderBy(asc(users.id));
  return rows.map(toUser);
};

export const getUsersByIds = async (ids: string[]): Promise<User[]> => {
  if (ids.length === 0) return [];
  const rows = await db.select().from(users).where(inArray(users.id, ids));
  return rows.map(toUser);
};

export async function insertUser(input: {
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
}): Promise<User> {
  const now = new Date();
  const [row] = await db
    .insert(users)
    .values({
      id: uuidv7(),
      name: input.name,
      email: input.email.toLowerCase(),
      image: input.image ?? null,
      emailVerified: input.emailVerified ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toUser(row!);
}

/** Insert unless the email already exists (concurrent-boot safe); the
 *  existing row — if any — is returned so callers converge on one user. */
export async function insertUserIfAbsent(input: {
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
}): Promise<User> {
  const now = new Date();
  const [row] = await db
    .insert(users)
    .values({
      id: uuidv7(),
      name: input.name,
      email: input.email.toLowerCase(),
      image: input.image ?? null,
      emailVerified: input.emailVerified ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: users.email })
    .returning();
  if (row) return toUser(row);
  const existing = await getUserByEmail(input.email);
  if (!existing) throw new Error("insertUserIfAbsent: user vanished after conflict");
  return existing;
}

/** Insert unless (userId, provider) exists — one account per provider. */
export async function insertAccountIfAbsent(input: {
  userId: string;
  provider: Account["provider"];
  providerAccountId?: string | null;
  passwordHash?: string | null;
}): Promise<void> {
  await db
    .insert(authAccounts)
    .values({
      id: uuidv7(),
      userId: input.userId,
      provider: input.provider,
      providerAccountId: input.providerAccountId ?? null,
      passwordHash: input.passwordHash ?? null,
      createdAt: new Date(),
    })
    .onConflictDoNothing({ target: [authAccounts.userId, authAccounts.provider] });
}

export async function updateUserProfile(
  id: string,
  patch: { name?: string; image?: string | null },
): Promise<User> {
  const [row] = await db
    .update(users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return toUser(row!);
}

/** Create a user + their personal workspace (org of one, creator = Owner) —
 *  the signup path shared by register and Google SSO. Atomic: user, org,
 *  membership, and the optional credential account commit together.
 *  See docs/foundation/04-plans-workspaces.md and ADR 0007. */
export async function createUserWithWorkspace(input: {
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  passwordHash?: string | null;
}): Promise<User> {
  return db.transaction(async (tx) => {
    const now = new Date();
    const [userRow] = await tx
      .insert(users)
      .values({
        id: uuidv7(),
        name: input.name,
        email: input.email.toLowerCase(),
        image: input.image ?? null,
        emailVerified: input.emailVerified ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    const user = toUser(userRow!);

    const [org] = await tx
      .insert(organizations)
      .values({
        id: uuidv7(),
        name: `${input.name}'s Workspace`,
        slug: `personal-${user.id.slice(-8)}`,
        type: "personal",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const [ownerRole] = await tx
      .select()
      .from(roles)
      .where(and(eq(roles.scope, "workspace"), eq(roles.name, "Owner"), isNull(roles.organizationId)))
      .limit(1);
    if (!ownerRole) throw new ApiError("internal_error", "workspace Owner role missing — seed incomplete");

    await tx.insert(organizationMembers).values({
      id: uuidv7(),
      organizationId: org!.id,
      userId: user.id,
      roleId: ownerRole.id,
      status: "active",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    if (input.passwordHash != null) {
      await tx.insert(authAccounts).values({
        id: uuidv7(),
        userId: user.id,
        provider: "credential",
        passwordHash: input.passwordHash,
        createdAt: now,
      });
    }
    return user;
  });
}

/* ---------------- sessions ---------------- */

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export async function insertSession(input: {
  token: string;
  userId: string;
  expiresAt: Date;
}): Promise<void> {
  await db.insert(sessions).values({
    id: uuidv7(),
    token: input.token,
    userId: input.userId,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
  });
}

/** Resolve a token to its (unexpired) user — the hot path of resolveUser. */
export async function findSessionUser(token: string): Promise<User | null> {
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ? toUser(row.user) : null;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/* ---------------- accounts ---------------- */

export interface Account {
  id: string;
  userId: string;
  provider: "credential" | "google";
  providerAccountId: string | null;
  passwordHash: string | null;
  createdAt: string;
}

type AccountRow = typeof authAccounts.$inferSelect;

const toAccount = (r: AccountRow): Account => ({
  id: r.id,
  userId: r.userId,
  provider: r.provider as Account["provider"],
  providerAccountId: r.providerAccountId,
  passwordHash: r.passwordHash,
  createdAt: r.createdAt.toISOString(),
});

export async function findAccount(
  userId: string,
  provider: Account["provider"],
): Promise<Account | null> {
  const [row] = await db
    .select()
    .from(authAccounts)
    .where(and(eq(authAccounts.userId, userId), eq(authAccounts.provider, provider)))
    .limit(1);
  return row ? toAccount(row) : null;
}

export async function insertAccount(input: {
  userId: string;
  provider: Account["provider"];
  providerAccountId?: string | null;
  passwordHash?: string | null;
}): Promise<Account> {
  const [row] = await db
    .insert(authAccounts)
    .values({
      id: uuidv7(),
      userId: input.userId,
      provider: input.provider,
      providerAccountId: input.providerAccountId ?? null,
      passwordHash: input.passwordHash ?? null,
      createdAt: new Date(),
    })
    .returning();
  return toAccount(row!);
}

export async function updateAccountPassword(
  accountId: string,
  passwordHash: string,
): Promise<void> {
  await db
    .update(authAccounts)
    .set({ passwordHash })
    .where(eq(authAccounts.id, accountId));
}

export async function upsertProviderAccount(input: {
  userId: string;
  provider: Exclude<Account["provider"], "credential">;
  providerAccountId: string;
}): Promise<void> {
  const existing = await findAccount(input.userId, input.provider);
  if (existing) {
    await db
      .update(authAccounts)
      .set({ providerAccountId: input.providerAccountId })
      .where(eq(authAccounts.id, existing.id));
  } else {
    await insertAccount({ ...input, passwordHash: null });
  }
}

/* ---------------- password resets ---------------- */

export interface PasswordReset {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

type ResetRow = typeof passwordResets.$inferSelect;

const toReset = (r: ResetRow): PasswordReset => ({
  id: r.id,
  token: r.token,
  userId: r.userId,
  expiresAt: r.expiresAt.toISOString(),
  usedAt: r.usedAt?.toISOString() ?? null,
  createdAt: r.createdAt.toISOString(),
});

export async function insertPasswordReset(input: {
  token: string;
  userId: string;
  expiresAt: Date;
}): Promise<void> {
  await db.insert(passwordResets).values({
    id: uuidv7(),
    token: input.token,
    userId: input.userId,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
  });
}

/** Valid = unused and unexpired. */
export async function findValidPasswordReset(token: string): Promise<PasswordReset | null> {
  const [row] = await db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.token, token),
        isNull(passwordResets.usedAt),
        gt(passwordResets.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row ? toReset(row) : null;
}

export async function markPasswordResetUsed(token: string): Promise<void> {
  await db
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(eq(passwordResets.token, token));
}
