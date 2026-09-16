/** Shared logger — JSON-line shape and error serialization. */
import { afterEach, describe, expect, it } from "vitest";
import { createLogger } from "../src/lib/logger";

// createLogger reads LOG_LEVEL at call time; tests otherwise pin "warn"
// (setup.ts), which would swallow the info/error lines under test.
const originalLevel = process.env.LOG_LEVEL;
afterEach(() => {
  process.env.LOG_LEVEL = originalLevel;
});

/** In-memory destination: parse each line pino writes. */
function captureLines() {
  const lines: Record<string, unknown>[] = [];
  const stream = {
    write(line: string) {
      lines.push(JSON.parse(line));
    },
  };
  return { stream, lines };
}

describe("logger", () => {
  it("writes one JSON line per event with level, message and fields", () => {
    process.env.LOG_LEVEL = "info";
    const { stream, lines } = captureLines();
    const log = createLogger(stream);

    log.info({ module: "test", ok: true }, "hello");

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: 30, msg: "hello", module: "test", ok: true });
  });

  it("serializes errors passed under err (message + stack)", () => {
    process.env.LOG_LEVEL = "info";
    const { stream, lines } = captureLines();
    const log = createLogger(stream);

    log.error({ err: new Error("boom") }, "request failed");

    expect(lines[0].level).toBe(50);
    expect(lines[0].err).toMatchObject({ type: "Error", message: "boom" });
    expect(lines[0].err).toHaveProperty("stack");
  });
});
