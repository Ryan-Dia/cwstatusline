import { describe, it, expect } from "vitest";
import { getDailyReset, getWeeklyReset } from "../src/data/reset.js";

describe("getDailyReset", () => {
  it("returns a label with hh:mm format", () => {
    const now = new Date("2026-04-17T14:30:00");
    const result = getDailyReset(now);
    expect(result.label).toMatch(/^\d{2}:\d{2}$/);
    expect(result.remainingMs).toBeGreaterThan(0);
  });
});

describe("getWeeklyReset", () => {
  it("rolling mode returns ~7 days", () => {
    const now = new Date("2026-04-17T14:30:00");
    const result = getWeeklyReset(null, now);
    const days = result.remainingMs / (1000 * 60 * 60 * 24);
    expect(days).toBeCloseTo(7, 0);
  });

  it("anchor mode returns time until next anchor day", () => {
    const now = new Date("2026-04-17T14:30:00"); // Friday
    const result = getWeeklyReset(1, now); // next Monday
    const days = result.remainingMs / (1000 * 60 * 60 * 24);
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(7);
  });
});
