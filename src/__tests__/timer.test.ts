import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

describe("timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updateElapsedDisplay sets elapsed text", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { updateElapsedDisplay } = await import("../timer");

    state.elapsedMs = 5200;
    updateElapsedDisplay();
    expect(dom.elapsed.textContent).toBe("0:05.2");
  });

  it("startRoundTimer initializes countdown display", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { startRoundTimer, stopRoundTimer } = await import("../timer");

    state.score = 0;
    const onTimeout = vi.fn();
    startRoundTimer(onTimeout);

    expect(dom.timer.textContent).toBe("1:00");
    expect(state.remainingMs).toBe(60_000);

    stopRoundTimer();
  });

  it("stopRoundTimer clears the interval", async () => {
    const { state } = await import("../state");
    const { startRoundTimer, stopRoundTimer } = await import("../timer");

    state.score = 0;
    startRoundTimer(vi.fn());
    stopRoundTimer();

    // After stopping, advancing time should not change remainingMs
    const remaining = state.remainingMs;
    vi.advanceTimersByTime(500);
    expect(state.remainingMs).toBe(remaining);
  });

  it("calls onTimeout when time runs out", async () => {
    const { state } = await import("../state");
    const { startRoundTimer } = await import("../timer");

    state.score = 0;
    const onTimeout = vi.fn();
    startRoundTimer(onTimeout);

    vi.advanceTimersByTime(61_000);
    expect(onTimeout).toHaveBeenCalled();
  });

  it("timer adds warning class at 50% remaining", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { startRoundTimer, stopRoundTimer } = await import("../timer");

    state.score = 0; // 60s limit
    startRoundTimer(vi.fn());

    // Advance to ~50% through (30s)
    vi.advanceTimersByTime(31_000);
    expect(dom.timer.className).toBe("warning");

    stopRoundTimer();
  });

  it("timer adds critical class at 25% remaining", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { startRoundTimer, stopRoundTimer } = await import("../timer");

    state.score = 0; // 60s limit
    startRoundTimer(vi.fn());

    // Advance to ~75% through (45s+)
    vi.advanceTimersByTime(46_000);
    expect(dom.timer.className).toBe("critical");

    stopRoundTimer();
  });
});

describe("timer visibility change", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    const { setupTimerListeners } = await import("../timer");
    setupTimerListeners();
  });

  afterEach(async () => {
    const { stopRoundTimer } = await import("../timer");
    stopRoundTimer();
    vi.useRealTimers();
  });

  it("fires timeout if tab was hidden past the deadline", async () => {
    const { state } = await import("../state");
    const { startRoundTimer } = await import("../timer");

    state.score = 0; // 60s limit
    const onTimeout = vi.fn();
    startRoundTimer(onTimeout);

    // Simulate background: advance real time past the deadline
    // Set roundStart to 65s ago so remainingMs computes to 0
    state.roundStart = Date.now() - 65_000;

    // Simulate returning to tab (hidden -> visible)
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(onTimeout).toHaveBeenCalled();
  });

  it("reschedules timeout if tab returns with time remaining", async () => {
    const { state } = await import("../state");
    const { startRoundTimer } = await import("../timer");

    state.score = 0; // 60s limit
    const onTimeout = vi.fn();
    startRoundTimer(onTimeout);

    // Simulate background: advance 30s (still time left)
    state.roundStart = Date.now() - 30_000;

    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    // Should not have fired yet
    expect(onTimeout).not.toHaveBeenCalled();
    // remainingMs should be resynced to ~30s
    expect(state.remainingMs).toBeCloseTo(30_000, -3);

    // Now advance past the remaining time
    vi.advanceTimersByTime(31_000);
    expect(onTimeout).toHaveBeenCalled();
  });

  it("does nothing when tab is hidden (only acts on return)", async () => {
    const { state } = await import("../state");
    const { startRoundTimer } = await import("../timer");

    state.score = 0;
    const onTimeout = vi.fn();
    startRoundTimer(onTimeout);

    // Simulate tab being hidden
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("does nothing if no active timer callback", async () => {
    const { state } = await import("../state");

    state.activeTimeoutCallback = null;

    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    // Should not throw
    document.dispatchEvent(new Event("visibilitychange"));
  });
});
