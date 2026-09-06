/** Tests for the HTTP transport — the single fetch boundary. fetch is stubbed
 *  globally; responses are minimal Response-shaped objects. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, req, upload } from "./http";

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("req", () => {
  it("prefixes /api, sends credentials and the JSON content type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [1, 2] }));
    vi.stubGlobal("fetch", fetchMock);

    const out = await req<{ data: number[] }>("/tasks");

    expect(out).toEqual({ data: [1, 2] });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tasks",
      expect.objectContaining({ credentials: "include" }),
    );
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("merges custom headers and passes init through", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchMock);

    await req("/organizations/org_1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Renamed" }),
      headers: { "X-Trace-Id": "t-1" },
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/organizations/org_1");
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe('{"name":"Renamed"}');
    expect(init.credentials).toBe("include");
    expect(init.headers).toEqual({ "Content-Type": "application/json", "X-Trace-Id": "t-1" });
  });

  it("returns undefined for 204 without parsing the body", async () => {
    const json = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, json });
    vi.stubGlobal("fetch", fetchMock);

    await expect(req<void>("/things/1", { method: "DELETE" })).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("throws ApiError with the envelope message on failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { message: "Forbidden" } }, 403));
    vi.stubGlobal("fetch", fetchMock);

    let err: unknown;
    try {
      await req("/organizations/org_1/members");
    } catch (e) {
      err = e;
    }

    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
    expect((err as ApiError).message).toBe("Forbidden");
    expect((err as ApiError).status).toBe(403);
  });

  it("falls back to a status message when the body has no error envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    vi.stubGlobal("fetch", fetchMock);

    await expect(req("/boom")).rejects.toMatchObject({
      message: "Request failed (500)",
      status: 500,
    });
  });

  it("falls back when the body is not valid JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(req("/boom")).rejects.toMatchObject({
      message: "Request failed (502)",
      status: 502,
    });
  });
});

describe("upload", () => {
  it("POSTs the file as multipart FormData without a Content-Type header", async () => {
    const res = { ok: true, status: 201 };
    const fetchMock = vi.fn().mockResolvedValue(res);
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["hello"], "logo.png", { type: "image/png" });

    const out = await upload("/uploads/logo", file);

    expect(out).toBe(res);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/uploads/logo");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.headers).toBeUndefined();
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBe(file);
  });
});
