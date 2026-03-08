import { describe, it, expect, beforeAll } from "vitest";
import { setupTestDOM } from "./test-dom";
import { getSwappedTime } from "../options";

beforeAll(() => {
  setupTestDOM();
});

describe("getSwappedTime", () => {
  it("swaps 3:00 to 12:15", () => {
    // Minute hand at :00 -> hour 12, hour hand at 3 -> minute 15
    const result = getSwappedTime(3, 0);
    expect(result).toEqual({ h: 12, m: 15 });
  });

  it("swaps 6:30 to 6:33", () => {
    // Minute hand at :30 -> hour 6, hour hand at 6.5 -> minute ~33
    const result = getSwappedTime(6, 30);
    expect(result.h).toBe(6);
    expect(result.m).toBeCloseTo(33, 0);
  });

  it("swaps 12:15 to 3:00", () => {
    // Minute hand at :15 -> hour 3, hour hand at 12.25 -> minute ~1
    const result = getSwappedTime(12, 15);
    expect(result.h).toBe(3);
    expect(result.m).toBeCloseTo(1, 0);
  });

  it("swaps 9:45 to 9:49", () => {
    // Minute hand at :45 -> hour 9, hour hand at 9.75 -> minute ~49
    const result = getSwappedTime(9, 45);
    expect(result.h).toBe(9);
    expect(result.m).toBeCloseTo(49, 0);
  });

  it("always returns hour in 1-12 range", () => {
    for (let h = 1; h <= 12; h++) {
      for (const m of [0, 15, 30, 45]) {
        const result = getSwappedTime(h, m);
        expect(result.h).toBeGreaterThanOrEqual(1);
        expect(result.h).toBeLessThanOrEqual(12);
      }
    }
  });

  it("always returns minutes in 0-59 range", () => {
    for (let h = 1; h <= 12; h++) {
      for (const m of [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]) {
        const result = getSwappedTime(h, m);
        expect(result.m).toBeGreaterThanOrEqual(0);
        expect(result.m).toBeLessThan(60);
      }
    }
  });
});
