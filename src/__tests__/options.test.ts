import { describe, it, expect, beforeAll } from "vitest";

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

describe("generateOptions", () => {
  it("returns exactly 6 options", async () => {
    const { state } = await import("../config");
    state.targetHours = 3;
    state.targetMinutes = 15;
    state.score = 0;

    const { generateOptions } = await import("../options");
    const options = generateOptions();
    expect(options).toHaveLength(6);
  });

  it("includes the correct answer", async () => {
    const { state } = await import("../config");
    state.targetHours = 7;
    state.targetMinutes = 30;

    const { generateOptions } = await import("../options");
    const options = generateOptions();
    const labels = options.map((o) => o.label);
    expect(labels).toContain("7:30");
  });

  it("has no duplicate labels", async () => {
    const { state } = await import("../config");
    state.targetHours = 6;
    state.targetMinutes = 0;

    const { generateOptions } = await import("../options");
    const options = generateOptions();
    const labels = options.map((o) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
