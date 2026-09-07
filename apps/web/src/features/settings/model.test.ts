/** Tests for the settings role vocabularies and the hasPerm gate. */
import { describe, expect, it } from "vitest";
import { hasPerm, PERM, PROJECT_ROLES, WORKSPACE_ROLES } from "./model";

describe("hasPerm", () => {
  it("is true when the key is present", () => {
    expect(hasPerm(["organization:update", "member:view"], PERM.orgUpdate)).toBe(true);
  });

  it("is false when the key is absent", () => {
    expect(hasPerm(["member:view"], PERM.orgUpdate)).toBe(false);
    expect(hasPerm([], PERM.orgUpdate)).toBe(false);
  });

  it("is false for undefined permissions", () => {
    expect(hasPerm(undefined, PERM.orgUpdate)).toBe(false);
  });
});

describe("role vocabularies", () => {
  it("lists the workspace roles the API expects", () => {
    expect(WORKSPACE_ROLES).toContain("Owner");
    expect(WORKSPACE_ROLES).toContain("Viewer");
    expect(new Set(WORKSPACE_ROLES).size).toBe(WORKSPACE_ROLES.length);
  });

  it("lists the project roles without duplicates", () => {
    expect(PROJECT_ROLES).toContain("Project Admin");
    expect(new Set(PROJECT_ROLES).size).toBe(PROJECT_ROLES.length);
  });
});

describe("PERM", () => {
  it("maps friendly keys to API permission strings", () => {
    expect(PERM.orgDelete).toBe("organization:delete");
    expect(PERM.projectManageMembers).toBe("project:manage-members");
    expect(PERM.billingManage).toBe("billing:manage");
  });
});
