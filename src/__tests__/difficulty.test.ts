import { describe, it, expect } from "vitest";
import { shouldShowHourNumber, pickRandomMinutes } from "../difficulty";

describe("shouldShowHourNumber", () => {
  it("shows all numbers at low scores", () => {
    for (let h = 1; h <= 12; h++) {
      expect(shouldShowHourNumber(0, h)).toBe(true);
      expect(shouldShowHourNumber(3, h)).toBe(true);
    }
  });

  it("hides non-quarter numbers at score 4", () => {
    expect(shouldShowHourNumber(4, 3)).toBe(true);
    expect(shouldShowHourNumber(4, 6)).toBe(true);
    expect(shouldShowHourNumber(4, 9)).toBe(true);
    expect(shouldShowHourNumber(4, 12)).toBe(true);

    expect(shouldShowHourNumber(4, 1)).toBe(false);
    expect(shouldShowHourNumber(4, 2)).toBe(false);
    expect(shouldShowHourNumber(4, 5)).toBe(false);
  });

  it("hides all numbers at score 6", () => {
    for (let h = 1; h <= 12; h++) {
      expect(shouldShowHourNumber(6, h)).toBe(false);
    }
  });
});

describe("pickRandomMinutes", () => {
  it("returns 5-minute increments at low scores", () => {
    for (let i = 0; i < 50; i++) {
      const m = pickRandomMinutes(0);
      expect(m % 5).toBe(0);
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThan(60);
    }
  });

  it("returns any minute at score 7+", () => {
    const minutes = new Set<number>();
    for (let i = 0; i < 500; i++) {
      minutes.add(pickRandomMinutes(7));
    }
    // With 500 iterations, we should see at least some non-5-minute values
    const hasNonFiveMultiple = [...minutes].some((m) => m % 5 !== 0);
    expect(hasNonFiveMultiple).toBe(true);
  });
});
