/** Auth + user profile schemas. */
import { z } from "zod";
import { id, iso } from "./common";

export const userSchema = z.object({
  id,
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: iso,
  updatedAt: iso,
});
export type User = z.infer<typeof userSchema>;

export const registerInput = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});
export const loginInput = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const forgotPasswordInput = z.object({
  email: z.string().email(),
});
export const resetPasswordInput = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(100),
});

export const userUpdate = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().nullable().optional(),
});
