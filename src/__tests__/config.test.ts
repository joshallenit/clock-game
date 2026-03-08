import { describe, it, expect, beforeAll } from "vitest";

// Minimal DOM required by config.ts module init
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

describe("getTimeLimitMs", () => {
  it("returns 60s at score 0", async () => {
    const { getTimeLimitMs } = await import("../config");
    expect(getTimeLimitMs(0)).toBe(60_000);
  });

  it("decreases as score increases", async () => {
    const { getTimeLimitMs } = await import("../config");
    expect(getTimeLimitMs(2)).toBeLessThan(getTimeLimitMs(0));
  });

  it("never drops below 30s before score 8", async () => {
    const { getTimeLimitMs } = await import("../config");
    for (let s = 0; s < 8; s++) {
      expect(getTimeLimitMs(s)).toBeGreaterThanOrEqual(30_000);
    }
  });

  it("returns 20s at score 8", async () => {
    const { getTimeLimitMs } = await import("../config");
    expect(getTimeLimitMs(8)).toBe(20_000);
  });

  it("returns 10s at score 9+", async () => {
    const { getTimeLimitMs } = await import("../config");
    expect(getTimeLimitMs(9)).toBe(10_000);
    expect(getTimeLimitMs(10)).toBe(10_000);
  });
});
