import { describe, it, expect, beforeEach, beforeAll } from "vitest";

// Set up minimal DOM before importing modules that query elements
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
});
