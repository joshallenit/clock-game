import { describe, it, expect, beforeAll } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

describe("generateOptions", () => {
  it("returns exactly 6 options", async () => {
    const { state } = await import("../state");
    state.targetHours = 3;
    state.targetMinutes = 15;
    state.score = 0;

    const { generateOptions } = await import("../options");
    const options = generateOptions();
    expect(options).toHaveLength(6);
  });

  it("includes the correct answer", async () => {
    const { state } = await import("../state");
    state.targetHours = 7;
    state.targetMinutes = 30;

    const { generateOptions } = await import("../options");
    const options = generateOptions();
    const labels = options.map((o) => o.label);
    expect(labels).toContain("7:30");
  });

  it("has no duplicate labels", async () => {
    const { state } = await import("../state");
    state.targetHours = 6;
    state.targetMinutes = 0;

    const { generateOptions } = await import("../options");
    const options = generateOptions();
    const labels = options.map((o) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
