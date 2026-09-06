/** Documents module — spaces, pages, file uploads, search. */
import { describe, expect, it } from "vitest";
import { api, setupProject, unique } from "./helpers";

interface PageRow {
  id: string;
  spaceId: string;
  title: string;
  updatedAt: string;
}

async function createSpace(p: { token: string; projectId: string }, name: string) {
  const res = await api(`/projects/${p.projectId}/documents/spaces`, {
    method: "POST",
    token: p.token,
    body: { name },
  });
  if (res.status !== 201) {
    throw new Error(`createSpace failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: { id: string; name: string } };
  return data;
}

async function createPage(
  p: { token: string; projectId: string },
  spaceId: string,
  title: string,
) {
  const res = await api(`/projects/${p.projectId}/documents/pages`, {
    method: "POST",
    token: p.token,
    body: { spaceId, title },
  });
  if (res.status !== 201) {
    throw new Error(`createPage failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: PageRow };
  return data;
}

describe("spaces", () => {
  it("creates and lists spaces", async () => {
    const p = await setupProject();
    const name = `Engineering ${unique()}`;
    const space = await createSpace(p, name);

    const list = await api(`/projects/${p.projectId}/documents/spaces`, { token: p.token });
    expect(list.status).toBe(200);
    const { data } = (await list.json()) as { data: { id: string; name: string }[] };
    expect(data.some((s) => s.id === space.id && s.name === name)).toBe(true);
  });

  it("soft-deletes a space", async () => {
    const p = await setupProject();
    const space = await createSpace(p, "Temp");
    const del = await api(`/projects/${p.projectId}/documents/spaces/${space.id}`, {
      method: "DELETE",
      token: p.token,
    });
    expect(del.status).toBe(204);

    const list = await api(`/projects/${p.projectId}/documents/spaces`, { token: p.token });
    const { data } = (await list.json()) as { data: { id: string }[] };
    expect(data.some((s) => s.id === space.id)).toBe(false);
  });
});

describe("pages", () => {
  it("creates a page in a space and returns it", async () => {
    const p = await setupProject();
    const space = await createSpace(p, "Docs");
    const page = await createPage(p, space.id, "Onboarding guide");

    const get = await api(`/projects/${p.projectId}/documents/pages/${page.id}`, {
      token: p.token,
    });
    expect(get.status).toBe(200);
    const { data } = (await get.json()) as { data: { title: string; spaceId: string } };
    expect(data.title).toBe("Onboarding guide");
    expect(data.spaceId).toBe(space.id);
  });

  it("returns 404 when creating a page in an unknown space", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/documents/pages`, {
      method: "POST",
      token: p.token,
      body: { spaceId: "0197d3b0-0000-7000-8000-000000000000", title: "Orphan" },
    });
    expect(res.status).toBe(404);
  });

  it("updates page fields", async () => {
    const p = await setupProject();
    const space = await createSpace(p, "Docs");
    const page = await createPage(p, space.id, "Old title");
    const res = await api(`/projects/${p.projectId}/documents/pages/${page.id}`, {
      method: "PATCH",
      token: p.token,
      body: { title: "New title" },
    });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { title: string } };
    expect(data.title).toBe("New title");
  });

  it("detects a stale updatedAt with 409 (optimistic concurrency)", async () => {
    const p = await setupProject();
    const space = await createSpace(p, "Docs");
    const page = await createPage(p, space.id, "Concurrent");
    const res = await api(`/projects/${p.projectId}/documents/pages/${page.id}`, {
      method: "PATCH",
      token: p.token,
      body: { title: "Clobbered", updatedAt: "2020-01-01T00:00:00.000Z" },
    });
    expect(res.status).toBe(409);
  });

  it("rejects content that breaks the ProseMirror shape with 400", async () => {
    const p = await setupProject();
    const space = await createSpace(p, "Docs");
    const page = await createPage(p, space.id, "Bad content");
    const res = await api(`/projects/${p.projectId}/documents/pages/${page.id}`, {
      method: "PATCH",
      token: p.token,
      body: { content: { type: 123 } }, // type must be a string
    });
    expect(res.status).toBe(400);
  });

  it("soft-deletes a page", async () => {
    const p = await setupProject();
    const space = await createSpace(p, "Docs");
    const page = await createPage(p, space.id, "Doomed");
    const del = await api(`/projects/${p.projectId}/documents/pages/${page.id}`, {
      method: "DELETE",
      token: p.token,
    });
    expect(del.status).toBe(204);
    expect(
      (await api(`/projects/${p.projectId}/documents/pages/${page.id}`, { token: p.token })).status,
    ).toBe(404);
  });
});

describe("search", () => {
  it("finds pages by title substring", async () => {
    const p = await setupProject();
    const space = await createSpace(p, "Docs");
    const needle = `zanzibar-${unique()}`;
    await createPage(p, space.id, `Guide to ${needle}`);

    const res = await api(`/projects/${p.projectId}/documents/search?q=${needle}`, {
      token: p.token,
    });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { title: string }[] };
    expect(data.some((pg) => pg.title.includes(needle))).toBe(true);
  });
});

describe("file uploads", () => {
  it("accepts an image upload and catalogs it", async () => {
    const p = await setupProject();
    const form = new FormData();
    // minimal 1x1 transparent PNG
    const png = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
      0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
      0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44,
      0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d,
      0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
      0x60, 0x82,
    ]);
    form.append("file", new File([png], "pixel.png", { type: "image/png" }));

    const res = await api(`/projects/${p.projectId}/documents/files`, {
      method: "POST",
      token: p.token,
      body: form,
    });
    expect(res.status).toBe(201);
    const { data } = (await res.json()) as {
      data: { id: string; name: string; mimeType: string; url: string };
    };
    expect(data.name).toBe("pixel.png");
    expect(data.mimeType).toBe("image/png");
    expect(data.url).toMatch(/^\/uploads\//);

    const list = await api(`/projects/${p.projectId}/documents/files`, { token: p.token });
    const listed = (await list.json()) as { data: { id: string }[] };
    expect(listed.data.some((f) => f.id === data.id)).toBe(true);
  });

  it("rejects a non-image upload with 400", async () => {
    const p = await setupProject();
    const form = new FormData();
    form.append("file", new File(["just text"], "notes.txt", { type: "text/plain" }));
    const res = await api(`/projects/${p.projectId}/documents/files`, {
      method: "POST",
      token: p.token,
      body: form,
    });
    expect(res.status).toBe(400);
  });

  it("rejects a missing file part with 400", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/documents/files`, {
      method: "POST",
      token: p.token,
      body: new FormData(),
    });
    expect(res.status).toBe(400);
  });
});

