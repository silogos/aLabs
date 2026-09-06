/** Tests for the shared date/time formatters. Datetimes without a timezone
 *  suffix are parsed as local time, so tests stay timezone-safe; the
 *  now-dependent helpers run under fake timers. */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dateShort, dateTime, isOverdue, timeAgo, timeShort, toLocalDate } from "./format";

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

  it("says 'just now' for anything under a minute", () => {
    expect(timeAgo(minutesAgo(0.5))).toBe("just now");
  });

  it("reports minutes", () => {
    expect(timeAgo(minutesAgo(5))).toBe("5 minutes ago");
    expect(timeAgo(minutesAgo(59))).toBe("59 minutes ago");
  });

  it("reports hours, singular and plural", () => {
    expect(timeAgo(minutesAgo(90))).toBe("1 hour ago");
    expect(timeAgo(minutesAgo(5 * 60))).toBe("5 hours ago");
  });

  it("reports days, singular and plural", () => {
    expect(timeAgo(minutesAgo(47 * 60))).toBe("1 day ago");
    expect(timeAgo(minutesAgo(3 * 24 * 60))).toBe("3 days ago");
  });
});

describe("dateShort", () => {
  it("formats a plain yyyy-mm-dd as 'Mon D'", () => {
    expect(dateShort("2026-03-24")).toBe("Mar 24");
  });

  it("formats a local ISO datetime the same day", () => {
    expect(dateShort("2026-03-24T14:30:00")).toBe("Mar 24");
  });

  it("returns '' for null, empty and invalid input", () => {
    expect(dateShort(null)).toBe("");
    expect(dateShort("")).toBe("");
    expect(dateShort("not-a-date")).toBe("");
    expect(dateShort("2026-13-99")).toBe("");
  });
});

describe("timeShort", () => {
  it("formats as 24h HH:mm", () => {
    expect(timeShort("2026-03-24T14:30:00")).toBe("14:30");
  });

  it("zero-pads single digits", () => {
    expect(timeShort("2026-03-24T09:05:00")).toBe("09:05");
  });
});

describe("dateTime", () => {
  it("combines short date and time with the · separator", () => {
    expect(dateTime("2026-03-24T14:30:00")).toBe("Mar 24 · 14:30");
  });
});

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is false for null and empty", () => {
    expect(isOverdue(null)).toBe(false);
    expect(isOverdue("")).toBe(false);
  });

  it("is true for a past datetime and false for a future one", () => {
    expect(isOverdue("2026-09-07T11:00:00")).toBe(true);
    expect(isOverdue("2026-09-07T13:00:00")).toBe(false);
  });
});

describe("toLocalDate", () => {
  it("formats a local Date as yyyy-mm-dd", () => {
    expect(toLocalDate(new Date(2026, 2, 24))).toBe("2026-03-24");
  });

  it("zero-pads month and day", () => {
    expect(toLocalDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toLocalDate(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});
