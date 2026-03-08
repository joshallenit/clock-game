import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

// Stub requestAnimationFrame so animations complete immediately.
// We advance a fake clock so that elapsed >= durationMs on the first frame.
function stubAnimationFrames(): void {
  let fakeNow = 0;
  vi.spyOn(performance, "now").mockImplementation(() => fakeNow);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    // Jump 10s ahead so any animation (max ~3.3s) finishes on next frame
    fakeNow += 10_000;
    Promise.resolve().then(() => cb(fakeNow));
    return 0;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
}

function mockMatchMedia(): void {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
}

describe("game", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockMatchMedia();
    stubAnimationFrames();
    localStorage.clear();
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    state.score = 0;
    state.mistakes = 0;
    state.elapsedMs = 0;
    state.transitioning = false;
    state.targetHours = 0;
    state.targetMinutes = 0;
    state.screenEffectInterval = null;
    state.timerInterval = null;
    state.roundTimeoutId = null;
    state.activeTimeoutCallback = null;
    state.elapsedInterval = null;
    dom.gameArea.hidden = false;
    dom.winScreen.hidden = true;
    dom.loseScreen.hidden = true;
    dom.answer.value = "";
  });

  afterEach(async () => {
    const { stopRoundTimer } = await import("../timer");
    const { stopScreenEffects } = await import("../screens");
    stopRoundTimer();
    stopScreenEffects();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Helper: initialize game and flush microtasks so animations complete
  async function bootGame(): Promise<void> {
    const { initGame } = await import("../game");
    initGame();
    // Flush microtask queue so rAF callbacks resolve
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);
  }

  it("initGame sets up initial state", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();

    expect(dom.mistakes.textContent).toContain("\u2764\uFE0F");
    expect(state.targetHours).toBeGreaterThanOrEqual(1);
    expect(state.targetHours).toBeLessThanOrEqual(12);
  });

  it("picks valid target time values", async () => {
    const { state } = await import("../state");

    await bootGame();

    expect(state.targetHours).toBeGreaterThanOrEqual(1);
    expect(state.targetHours).toBeLessThanOrEqual(12);
    expect(state.targetMinutes).toBeGreaterThanOrEqual(0);
    expect(state.targetMinutes).toBeLessThan(60);
  });

  it("generates 5-minute increment times at low scores", async () => {
    const { state } = await import("../state");

    for (let i = 0; i < 20; i++) {
      state.score = 0;
      state.mistakes = 0;
      await bootGame();
      expect(state.targetMinutes % 5).toBe(0);
    }
  });

  it("win and lose screens start hidden", async () => {
    const { dom } = await import("../dom");
    expect(dom.winScreen.hidden).toBe(true);
    expect(dom.loseScreen.hidden).toBe(true);
  });

  it("correct text input increments score", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();
    state.transitioning = false;
    state.targetHours = 7;
    state.targetMinutes = 30;
    state.correctLabel = "7:30";

    dom.answer.value = "7:30";
    dom.submitBtn.click();

    expect(state.score).toBe(1);
    expect(dom.feedback.textContent).toContain("Correct");
  });

  it("incorrect text input increments mistakes", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();
    state.transitioning = false;
    state.targetHours = 7;
    state.targetMinutes = 30;
    state.correctLabel = "7:30";

    dom.answer.value = "3:15";
    dom.submitBtn.click();

    expect(state.mistakes).toBe(1);
    expect(dom.feedback.textContent).toContain("Incorrect");
  });

  it("invalid text input shows format hint without counting as mistake", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();
    state.transitioning = false;
    state.targetHours = 7;
    state.targetMinutes = 30;
    state.correctLabel = "7:30";

    dom.answer.value = "abc";
    dom.submitBtn.click();

    expect(state.mistakes).toBe(0);
    expect(state.score).toBe(0);
    expect(dom.feedback.textContent).toContain("H:MM");
  });

  it("reaching winning score shows win screen", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();
    state.transitioning = false;
    state.score = 9;
    state.targetHours = 4;
    state.targetMinutes = 0;
    state.correctLabel = "4:00";

    dom.answer.value = "4:00";
    dom.submitBtn.click();

    expect(state.score).toBe(10);
    expect(dom.winScreen.hidden).toBe(false);
    expect(dom.gameArea.hidden).toBe(true);
  });

  it("reaching max mistakes shows lose screen", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();
    state.transitioning = false;
    state.mistakes = 4;
    state.targetHours = 4;
    state.targetMinutes = 0;
    state.correctLabel = "4:00";

    dom.answer.value = "9:15";
    dom.submitBtn.click();

    expect(state.mistakes).toBe(5);
    expect(dom.loseScreen.hidden).toBe(false);
    expect(dom.gameArea.hidden).toBe(true);
  });

  it("play again resets the game from win screen", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();

    state.transitioning = false;
    state.score = 9;
    state.targetHours = 4;
    state.targetMinutes = 0;
    state.correctLabel = "4:00";
    dom.answer.value = "4:00";
    dom.submitBtn.click();
    expect(dom.winScreen.hidden).toBe(false);

    dom.playAgainBtn.click();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);

    expect(state.score).toBe(0);
    expect(state.mistakes).toBe(0);
    expect(dom.gameArea.hidden).toBe(false);
    expect(dom.winScreen.hidden).toBe(true);
  });

  it("try again resets the game from lose screen", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();

    state.transitioning = false;
    state.mistakes = 4;
    state.targetHours = 4;
    state.targetMinutes = 0;
    state.correctLabel = "4:00";
    dom.answer.value = "9:00";
    dom.submitBtn.click();
    expect(dom.loseScreen.hidden).toBe(false);

    dom.tryAgainBtn.click();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);

    expect(state.score).toBe(0);
    expect(state.mistakes).toBe(0);
    expect(dom.gameArea.hidden).toBe(false);
    expect(dom.loseScreen.hidden).toBe(true);
  });

  it("ignores input during transitions", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();
    state.transitioning = true;
    state.targetHours = 7;
    state.targetMinutes = 30;
    state.correctLabel = "7:30";

    dom.answer.value = "7:30";
    dom.submitBtn.click();

    expect(state.score).toBe(0);
  });

  it("timeout counts as a mistake", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");

    await bootGame();
    state.transitioning = false;
    state.targetHours = 7;
    state.targetMinutes = 30;
    state.correctLabel = "7:30";

    // The game's unlockControls already started a round timer, so advance past it
    vi.advanceTimersByTime(61_000);

    expect(state.mistakes).toBeGreaterThanOrEqual(1);
    expect(dom.feedback.textContent).toContain("Time's up");
  });
});
