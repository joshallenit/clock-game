import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  // Mock matchMedia for effects that check prefers-reduced-motion
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
  setupTestDOM();
});

describe("screens", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    state.score = 5;
    state.mistakes = 0;
    state.elapsedMs = 30000;
    state.screenEffectInterval = null;
    dom.gameArea.hidden = false;
    dom.winScreen.hidden = true;
    dom.loseScreen.hidden = true;
  });

  afterEach(async () => {
    const { stopScreenEffects } = await import("../screens");
    stopScreenEffects();
    vi.useRealTimers();
  });

  it("showWinScreen hides game area and reveals win screen", async () => {
    const { dom } = await import("../dom");
    const { showWinScreen } = await import("../screens");

    showWinScreen();

    expect(dom.gameArea.hidden).toBe(true);
    expect(dom.winScreen.hidden).toBe(false);
    expect(dom.loseScreen.hidden).toBe(true);
  });

  it("showLoseScreen hides game area and reveals lose screen", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { showLoseScreen } = await import("../screens");

    state.score = 3;
    showLoseScreen();

    expect(dom.gameArea.hidden).toBe(true);
    expect(dom.loseScreen.hidden).toBe(false);
    expect(dom.winScreen.hidden).toBe(true);
    expect(dom.finalScoreValue.textContent).toBe("3");
  });

  it("stopScreenEffects clears interval", async () => {
    const { state } = await import("../state");
    const { stopScreenEffects } = await import("../screens");

    state.screenEffectInterval = setInterval(() => {}, 1000);
    stopScreenEffects();

    expect(state.screenEffectInterval).toBeNull();
  });
});
