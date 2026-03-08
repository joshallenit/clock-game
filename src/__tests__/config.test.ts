import { describe, it, expect, beforeAll } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

describe("getTimeLimitMs", () => {
  it("returns 60s at score 0", async () => {
    const { getTimeLimitMs } = await import("../constants");
    expect(getTimeLimitMs(0)).toBe(60_000);
  });

  it("decreases as score increases", async () => {
    const { getTimeLimitMs } = await import("../constants");
    expect(getTimeLimitMs(2)).toBeLessThan(getTimeLimitMs(0));
  });

  it("never drops below 30s before score 8", async () => {
    const { getTimeLimitMs } = await import("../constants");
    for (let s = 0; s < 8; s++) {
      expect(getTimeLimitMs(s)).toBeGreaterThanOrEqual(30_000);
    }
  });

  it("returns 20s at score 8", async () => {
    const { getTimeLimitMs } = await import("../constants");
    expect(getTimeLimitMs(8)).toBe(20_000);
  });

  it("returns 10s at score 9+", async () => {
    const { getTimeLimitMs } = await import("../constants");
    expect(getTimeLimitMs(9)).toBe(10_000);
    expect(getTimeLimitMs(10)).toBe(10_000);
  });
});
