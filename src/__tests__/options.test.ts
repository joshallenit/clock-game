import { describe, it, expect, beforeAll } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

describe("generateOptions", () => {
  it("returns exactly 6 options", async () => {
    const { generateOptions } = await import("../options");
    const options = generateOptions(3, 15, 0);
    expect(options).toHaveLength(6);
  });

  it("includes the correct answer", async () => {
    const { generateOptions } = await import("../options");
    const options = generateOptions(7, 30, 0);
    const labels = options.map((o) => o.label);
    expect(labels).toContain("7:30");
  });

  it("has no duplicate labels", async () => {
    const { generateOptions } = await import("../options");
    const options = generateOptions(6, 0, 0);
    const labels = options.map((o) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("includes swapped and nearby hour variants", async () => {
    const { generateOptions } = await import("../options");
    const options = generateOptions(3, 15, 0);
    const labels = options.map((o) => o.label);
    expect(labels).toContain("3:15");
    expect(labels).toContain("4:15");
    expect(labels).toContain("2:15");
  });

  it("always produces 6 unique options for edge cases", async () => {
    const { generateOptions } = await import("../options");
    // 12:00 is tricky: swapped is also 12:00, so dedup must fill extras
    const options = generateOptions(12, 0, 0);
    expect(options).toHaveLength(6);
    const labels = options.map((o) => o.label);
    expect(new Set(labels).size).toBe(6);
  });

  it("works at high scores with random minutes", async () => {
    const { generateOptions } = await import("../options");
    for (let i = 0; i < 10; i++) {
      const options = generateOptions(5, 23, 8);
      expect(options).toHaveLength(6);
      expect(options.map((o) => o.label)).toContain("5:23");
    }
  });
});
