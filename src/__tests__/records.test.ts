import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

function getTodayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `clockRecord_${d.getFullYear()}-${month}-${day}`;
}

describe("records", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("isNewRecord returns true when no record exists", async () => {
    const { isNewRecord } = await import("../records");
    expect(isNewRecord(50000)).toBe(true);
  });

  it("isNewRecord returns true when beating existing record", async () => {
    localStorage.setItem(getTodayKey(), JSON.stringify({ time: 60000, name: "Test" }));
    const { isNewRecord } = await import("../records");
    expect(isNewRecord(50000)).toBe(true);
  });

  it("isNewRecord returns false when slower than existing record", async () => {
    localStorage.setItem(getTodayKey(), JSON.stringify({ time: 40000, name: "Test" }));
    const { isNewRecord } = await import("../records");
    expect(isNewRecord(50000)).toBe(false);
  });

  it("handles corrupt localStorage data gracefully", async () => {
    localStorage.setItem(getTodayKey(), "not valid json{{{");
    const { isNewRecord } = await import("../records");
    expect(isNewRecord(50000)).toBe(true);
    // corrupt key should be removed
    expect(localStorage.getItem(getTodayKey())).toBeNull();
  });

  it("handles wrong-shape localStorage data gracefully", async () => {
    // Valid JSON but not a DailyRecord shape
    localStorage.setItem(getTodayKey(), JSON.stringify({ wrong: "shape" }));
    const { isNewRecord } = await import("../records");
    expect(isNewRecord(50000)).toBe(true);
    // invalid record should be removed
    expect(localStorage.getItem(getTodayKey())).toBeNull();
  });
});
