/** Auth service — session lifecycle: login, register, password reset, me. */
import type {
  User,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "@pmin/core";
import { req, upload } from "@/lib/http";

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

  changePassword: (body: ChangePasswordInput) =>
    req<{ data: { ok: boolean } }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updateMe: (body: { name?: string; image?: string | null }) =>
    req<{ data: User }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  /** Upload an avatar image; the server stores it and returns the fresh
   *  user with `image` pointing at the served /uploads/<id> URL. */
  uploadAvatar: async (file: File): Promise<User> => {
    const res = await upload("/users/me/avatar", file);
    const body = (await res.json().catch(() => ({}))) as {
      data?: User;
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(body?.error?.message ?? `Upload failed (${res.status})`);
    }
    return body.data!;
  },
};
