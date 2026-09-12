/** Demo-seed gate — flag resolution only (boot wiring is env-driven at
 *  module load, so the pure function is what's testable in-process). */
import { describe, expect, it } from "vitest";
import { demoSeedEnabled } from "../src/db/seed-mode";

describe("demoSeedEnabled", () => {
  it("defaults on outside production (dev/test keep the zero-config demo boot)", () => {
    expect(demoSeedEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(demoSeedEnabled({ NODE_ENV: "test" })).toBe(true);
  });

  it("defaults off in production", () => {
    expect(demoSeedEnabled({ NODE_ENV: "production" })).toBe(false);
  });

  it("SEED_DEMO forces seeding on in production", () => {
    expect(demoSeedEnabled({ NODE_ENV: "production", SEED_DEMO: "true" })).toBe(true);
    expect(demoSeedEnabled({ NODE_ENV: "production", SEED_DEMO: "1" })).toBe(true);
  });

  it("SEED_DEMO forces seeding off outside production (prod-like local boot)", () => {
    expect(demoSeedEnabled({ NODE_ENV: "development", SEED_DEMO: "false" })).toBe(false);
    expect(demoSeedEnabled({ NODE_ENV: "development", SEED_DEMO: "0" })).toBe(false);
  });

  it("ignores case and surrounding whitespace", () => {
    expect(demoSeedEnabled({ NODE_ENV: "production", SEED_DEMO: " TRUE " })).toBe(true);
    expect(demoSeedEnabled({ NODE_ENV: "test", SEED_DEMO: "No" })).toBe(false);
  });

  it("treats unrecognized or blank values as unset (falls back to NODE_ENV)", () => {
    expect(demoSeedEnabled({ NODE_ENV: "production", SEED_DEMO: "yes-please" })).toBe(false);
    expect(demoSeedEnabled({ NODE_ENV: "development", SEED_DEMO: "" })).toBe(true);
    expect(demoSeedEnabled({ NODE_ENV: "development", SEED_DEMO: "   " })).toBe(true);
  });
});
