/** Tests for task display serials — the module-level active project key. */
import { afterEach, describe, expect, it } from "vitest";
import { projKey, setActiveProjectKey, taskSerial } from "./serial";

afterEach(() => {
  // Don't leak the swapped key into other tests in this file.
  setActiveProjectKey("ATL");
});

describe("taskSerial", () => {
  it("uses the default 'ATL' key", () => {
    expect(projKey()).toBe("ATL");
    expect(taskSerial(42)).toBe("ATL-42");
  });

  it("uses numeric and string ids verbatim", () => {
    expect(taskSerial(7)).toBe("ATL-7");
    expect(taskSerial("abc123")).toBe("ATL-abc123");
  });

  it("follows setActiveProjectKey", () => {
    setActiveProjectKey("PMX");
    expect(projKey()).toBe("PMX");
    expect(taskSerial(15)).toBe("PMX-15");
  });
});
