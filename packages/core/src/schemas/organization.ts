/** Organization, roles, members, invitations + project members. */
import { z } from "zod";
import { id, iso } from "./common";
import { userSchema } from "./auth";
import {
  MemberStatus,
  InvitationStatus,
  RoleScope,
  OrganizationType,
} from "../enums";

export const organizationSchema = z.object({
  id,
  name: z.string(),
  slug: z.string(),
  type: OrganizationType,
  logo: z.string().nullable(),
  description: z.string().nullable(),
  timezone: z.string(),
  language: z.string(),
  website: z.string().nullable(),
  createdAt: iso,
  updatedAt: iso,
});
export type Organization = z.infer<typeof organizationSchema>;

export const organizationCreate = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  website: z.string().url().optional(),
});
export const organizationUpdate = organizationCreate.partial();

export const roleSchema = z.object({
  id,
  organizationId: id.nullable(),
  scope: RoleScope,
  name: z.string(),
  isSystem: z.boolean(),
  permissions: z.array(z.string()),
});
export type Role = z.infer<typeof roleSchema>;

export const memberUpdate = z.object({ roleName: z.string().min(1) });

export const memberSchema = z.object({
  id,
  organizationId: id,
  userId: id,
  role: roleSchema,
  status: MemberStatus,
  joinedAt: iso.nullable(),
  user: userSchema,
  createdAt: iso,
  updatedAt: iso,
});
export type Member = z.infer<typeof memberSchema>;

export const invitationCreate = z.object({
  email: z.string().email(),
  roleName: z.string(),
});
export const invitationAction = z.object({ action: z.enum(["accept", "cancel"]) });
export const invitationSchema = z.object({
  id,
  organizationId: id,
  email: z.string(),
  status: InvitationStatus,
  roleName: z.string(),
  expiresAt: iso,
  createdAt: iso,
});
export type Invitation = z.infer<typeof invitationSchema>;

export const projectMemberSchema = z.object({
  id,
  projectId: id,
  userId: id,
  role: roleSchema,
  status: MemberStatus,
  joinedAt: iso.nullable(),
  user: userSchema,
  createdAt: iso,
  updatedAt: iso,
});
export type ProjectMember = z.infer<typeof projectMemberSchema>;

export const projectMemberAdd = z.object({
  email: z.string().email(),
  roleName: z.string().optional(),
});
export const projectMemberUpdate = z.object({
  roleName: z.string().min(1).optional(),
  status: z.literal("active").optional(),
});
