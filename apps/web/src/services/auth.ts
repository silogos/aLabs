/** Auth service — session lifecycle: login, register, password reset, me. */
import { z } from "zod";
import { loginInput, registerInput, forgotPasswordInput, resetPasswordInput } from "@pmin/core";
import type { User } from "@pmin/core";
import { req } from "@/lib/http";

export const authService = {
  me: () => req<{ data: User }>("/auth/me").then((x) => x.data),

  login: (body: z.input<typeof loginInput>) =>
    req<{ data: { user: User; token: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  register: (body: z.input<typeof registerInput>) =>
    req<{ data: { user: User; token: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  logout: () =>
    req<{ data: { ok: boolean } }>("/auth/logout", { method: "POST" }).then((x) => x.data),

  forgotPassword: (body: z.input<typeof forgotPasswordInput>) =>
    req<{ data: { ok: boolean; resetPath?: string } }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  resetPassword: (body: z.input<typeof resetPasswordInput>) =>
    req<{ data: { ok: boolean } }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
};
