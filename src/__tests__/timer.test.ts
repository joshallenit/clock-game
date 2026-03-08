import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";

// Minimal DOM for module imports
beforeAll(() => {
  document.body.innerHTML = `
    <div id="timer-group"><div id="elapsed"></div><div id="record-banner"></div></div>
    <div id="name-modal"><div class="modal-box"><div id="new-record-time"></div><input id="name-input"><button id="name-submit-btn"></button></div></div>
    <canvas id="confetti-canvas" width="1000" height="1000"></canvas>
    <main id="game-area">
      <div id="game-layout">
        <div id="left-panel"><div id="timer"></div><div id="score"></div><div id="mistakes"></div></div>
        <canvas id="clock" width="500" height="500"></canvas>
        <div id="right-panel"><div id="options-panel"></div><div id="input-row"><input id="answer"><button id="submit-btn"></button></div></div>
      </div>
      <div id="feedback"></div>
    </main>
    <section id="win-screen"><button id="play-again-btn"></button></section>
    <section id="lose-screen"><div class="lose-box"><span id="final-score-value"></span></div><button id="try-again-btn"></button></section>
  `;
});

describe("timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updateElapsedDisplay sets elapsed text", async () => {
    const { state, dom } = await import("../config");
    const { updateElapsedDisplay } = await import("../timer");

    state.elapsedMs = 5200;
    updateElapsedDisplay();
    expect(dom.elapsed.textContent).toBe("0:05.2");
  });

  it("startRoundTimer initializes countdown display", async () => {
    const { state, dom } = await import("../config");
    const { startRoundTimer, stopRoundTimer } = await import("../timer");

    state.score = 0;
    const onTimeout = vi.fn();
    startRoundTimer(onTimeout);

    expect(dom.timer.textContent).toBe("1:00");
    expect(state.remainingMs).toBe(60_000);

    stopRoundTimer();
  });

  it("stopRoundTimer clears the interval", async () => {
    const { state } = await import("../config");
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
    const { state } = await import("../config");
    const { startRoundTimer } = await import("../timer");

    state.score = 0;
    const onTimeout = vi.fn();
    startRoundTimer(onTimeout);

    vi.advanceTimersByTime(61_000);
    expect(onTimeout).toHaveBeenCalled();
  });

  it("timer adds warning class at 50% remaining", async () => {
    const { state, dom } = await import("../config");
    const { startRoundTimer, stopRoundTimer } = await import("../timer");

    state.score = 0; // 60s limit
    startRoundTimer(vi.fn());

    // Advance to ~50% through (30s)
    vi.advanceTimersByTime(31_000);
    expect(dom.timer.className).toBe("warning");

    stopRoundTimer();
  });

  it("timer adds critical class at 25% remaining", async () => {
    const { state, dom } = await import("../config");
    const { startRoundTimer, stopRoundTimer } = await import("../timer");

    state.score = 0; // 60s limit
    startRoundTimer(vi.fn());

    // Advance to ~75% through (45s+)
    vi.advanceTimersByTime(46_000);
    expect(dom.timer.className).toBe("critical");

    stopRoundTimer();
  });
});
