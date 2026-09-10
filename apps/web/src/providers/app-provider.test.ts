import { describe, expect, it } from "vitest";
import { tenantFromPath, viewPath, taskFromPath, VIEW_PATH } from "./app-provider";

describe("tenantFromPath", () => {
  it("parses the project shape /{org}/{project}/{view}", () => {
    expect(tenantFromPath("/acme/website/tasks")).toEqual({
      orgSlug: "acme",
      projectSlug: "website",
    });
  });

  it("accepts every known view as the third segment", () => {
    for (const view of Object.values(VIEW_PATH)) {
      expect(tenantFromPath(`/a/b/${view}`)).toEqual({ orgSlug: "a", projectSlug: "b" });
    }
  });

  it("org pages stay project-less (2 segments, no view)", () => {
    expect(tenantFromPath("/acme")).toEqual({ orgSlug: "acme" });
    expect(tenantFromPath("/acme/settings")).toEqual({ orgSlug: "acme" });
    expect(tenantFromPath("/acme/members")).toEqual({ orgSlug: "acme" });
    // a project named "settings" still resolves via its 3-segment URL
    expect(tenantFromPath("/acme/settings/dashboard")).toEqual({
      orgSlug: "acme",
      projectSlug: "settings",
    });
  });

  it("static roots are never org slugs", () => {
    expect(tenantFromPath("/")).toEqual({});
    expect(tenantFromPath("/user")).toEqual({});
    expect(tenantFromPath("/notifications")).toEqual({});
    expect(tenantFromPath("/tasks")).toEqual({});
    expect(tenantFromPath("/projects")).toEqual({});
    expect(tenantFromPath("/orgs")).toEqual({});
    expect(tenantFromPath("/login")).toEqual({});
    expect(tenantFromPath("/register")).toEqual({});
  });

  it("project board URLs still resolve behind a static root name", () => {
    // /tasks is the user page, but /tasks-as-org/proj/tasks is a project URL
    expect(tenantFromPath("/tasks/proj/tasks")).toEqual({
      orgSlug: "tasks",
      projectSlug: "proj",
    });
  });
});

describe("viewPath", () => {
  it("builds the canonical shareable URL", () => {
    expect(viewPath("tasks", "acme", "website")).toBe("/acme/website/tasks");
    expect(viewPath("dashboard", "acme", "website")).toBe("/acme/website/dashboard");
  });
});

describe("taskFromPath", () => {
  it("parses the task deep link /{org}/{project}/tasks/{taskNumber}", () => {
    expect(taskFromPath("/acme/website/tasks/4")).toBe("4");
    expect(taskFromPath("/acme/website/tasks/1024")).toBe("1024");
  });

  it("no task on the bare board, other views, or user pages", () => {
    expect(taskFromPath("/acme/website/tasks")).toBeNull();
    expect(taskFromPath("/acme/website/documents/4")).toBeNull();
    expect(taskFromPath("/tasks")).toBeNull();
    expect(taskFromPath("/")).toBeNull();
  });
});
