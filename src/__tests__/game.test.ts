import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

describe("game", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  it("initGame sets up initial state", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { initGame } = await import("../game");

    state.score = 0;
    state.mistakes = 0;
    initGame();

    // Mistakes hearts are rendered
    expect(dom.mistakes.textContent).toContain("\u2764\uFE0F");
    // Controls locked during initial spin animation
    expect(state.transitioning).toBe(true);
  });

  it("picks valid target time values", async () => {
    const { state } = await import("../state");
    const { initGame } = await import("../game");

    state.score = 0;
    state.mistakes = 0;
    initGame();

    expect(state.targetHours).toBeGreaterThanOrEqual(1);
    expect(state.targetHours).toBeLessThanOrEqual(12);
    expect(state.targetMinutes).toBeGreaterThanOrEqual(0);
    expect(state.targetMinutes).toBeLessThan(60);
  });

  it("generates 5-minute increment times at low scores", async () => {
    const { state } = await import("../state");
    const { initGame } = await import("../game");

    for (let i = 0; i < 20; i++) {
      state.score = 0;
      state.mistakes = 0;
      initGame();
      expect(state.targetMinutes % 5).toBe(0);
    }
  });

  it("win and lose screens start hidden", async () => {
    const { dom } = await import("../dom");
    expect(dom.winScreen.hidden).toBe(true);
    expect(dom.loseScreen.hidden).toBe(true);
  });
});
