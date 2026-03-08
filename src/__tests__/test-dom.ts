import { vi } from "vitest";
import { initDom } from "../dom";
import { initColors } from "../colors";
import { initClock } from "../clock";
import { initEffects } from "../effects";
import { initDog } from "../dog";
import { initRecords } from "../records";

/** Shared DOM + module setup matching index.html structure. Call in beforeAll(). */
export function setupTestDOM(): void {
  // Mock canvas getContext for modules that grab it at init time
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

  // Initialize modules in the same order as main.ts
  initDom();
  initColors();
  initRecords();
  initClock();
  initEffects();
  initDog();
}
