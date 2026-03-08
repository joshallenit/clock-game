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
