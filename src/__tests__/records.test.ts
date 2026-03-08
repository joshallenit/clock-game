import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { setupTestDOM } from "./test-dom";
import { dom } from "../dom";
import { state } from "../state";
import { updateRecordBanner, submitName } from "../records";

beforeAll(() => {
  // Mock fetch before setupTestDOM since initRecords fires a fetch
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ scores: [] }),
  } as Response);
  setupTestDOM();
});

describe("records", () => {
  beforeEach(() => {
    vi.mocked(globalThis.fetch).mockReset();
  });

  it("updateRecordBanner renders scores from API", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          scores: [
            { name: "Alice", time: 30000 },
            { name: "Bob", time: 45000 },
          ],
        }),
    } as Response);

    await updateRecordBanner();

    expect(dom.recordBanner.textContent).toContain("Alice");
    expect(dom.recordBanner.textContent).toContain("Bob");
    expect(dom.recordBanner.textContent).toContain("Today's Fastest");
  });

  it("updateRecordBanner shows fallback when API fails", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(
      new Error("Network error"),
    );

    await updateRecordBanner();

    expect(dom.recordBanner.textContent).toBe("No records yet!");
  });

  it("updateRecordBanner shows fallback when scores are empty", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ scores: [] }),
    } as Response);

    await updateRecordBanner();

    expect(dom.recordBanner.textContent).toBe("No records yet!");
  });

  it("submitName posts score and updates banner", async () => {
    const mockResponse = {
      rank: 1,
      scores: [{ name: "TestPlayer", time: 25000 }],
    };
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    dom.nameInput.value = "TestPlayer";
    state.elapsedMs = 25000;

    await submitName();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/scores",
      expect.objectContaining({ method: "POST" }),
    );
    expect(dom.recordBanner.textContent).toContain("TestPlayer");
  });
});
