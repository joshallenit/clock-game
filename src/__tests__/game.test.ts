import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

// Mock canvas getContext before any module loads
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  quadraticCurveTo: vi.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
  lineCap: "butt",
  font: "",
  textAlign: "start",
  textBaseline: "alphabetic",
  globalAlpha: 1,
  shadowColor: "",
  shadowBlur: 0,
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

beforeAll(() => {
  document.body.innerHTML = `
    <div id="timer-group"><div id="elapsed"></div><div id="record-banner"></div></div>
    <div id="name-modal" hidden><div class="modal-box"><div id="new-record-time"></div><input id="name-input"><button id="name-submit-btn"></button></div></div>
    <canvas id="confetti-canvas" width="1000" height="1000"></canvas>
    <main id="game-area">
      <div id="game-layout">
        <div id="left-panel"><div id="timer"></div><div id="score"></div><div id="mistakes"></div></div>
        <canvas id="clock" width="500" height="500"></canvas>
        <div id="right-panel"><div id="options-panel"></div><div id="input-row"><input id="answer"><button id="submit-btn"></button></div></div>
      </div>
      <div id="feedback"></div>
    </main>
    <section id="win-screen" hidden><button id="play-again-btn"></button></section>
    <section id="lose-screen" hidden><div class="lose-box"><span id="final-score-value"></span></div><button id="try-again-btn"></button></section>
  `;
});

describe("game", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  it("initGame sets up initial state", async () => {
    const { state, dom } = await import("../config");
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
    const { state } = await import("../config");
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
    const { state } = await import("../config");
    const { initGame } = await import("../game");

    for (let i = 0; i < 20; i++) {
      state.score = 0;
      state.mistakes = 0;
      initGame();
      expect(state.targetMinutes % 5).toBe(0);
    }
  });

  it("win and lose screens start hidden", async () => {
    const { dom } = await import("../config");
    expect(dom.winScreen.hidden).toBe(true);
    expect(dom.loseScreen.hidden).toBe(true);
  });
});
