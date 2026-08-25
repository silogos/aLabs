/** Auth service — session lifecycle: login, register, password reset, me. */
import type {
  User,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@pmin/core";
import { req } from "@/lib/http";

export const authService = {
  me: () => req<{ data: User }>("/auth/me").then((x) => x.data),

  login: (body: LoginInput) =>
    req<{ data: { user: User; token: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  register: (body: RegisterInput) =>
    req<{ data: { user: User; token: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  logout: () =>
    req<{ data: { ok: boolean } }>("/auth/logout", { method: "POST" }).then((x) => x.data),

  forgotPassword: (body: ForgotPasswordInput) =>
    req<{ data: { ok: boolean; resetPath?: string } }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  resetPassword: (body: ResetPasswordInput) =>
    req<{ data: { ok: boolean } }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
};
