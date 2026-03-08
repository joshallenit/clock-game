import { describe, it, expect, beforeAll } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

describe("COLORS proxy", () => {
  it("returns live palette values", async () => {
    const { COLORS } = await import("../colors");

    // Should return a string value for all palette keys
    expect(typeof COLORS.background).toBe("string");
    expect(typeof COLORS.text).toBe("string");
    expect(typeof COLORS.accent).toBe("string");
    expect(typeof COLORS.dog).toBe("string");
  });

  it("getConfettiColors returns a non-empty array", async () => {
    const { getConfettiColors } = await import("../colors");
    const colors = getConfettiColors();
    expect(colors.length).toBeGreaterThan(0);
    expect(typeof colors[0]).toBe("string");
  });
});
