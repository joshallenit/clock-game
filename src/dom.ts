import type { DomRefs } from "./types";

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

/** DOM refs are populated by initDom(). Accessing before init throws on use. */
export const dom = {} as DomRefs;

/** Populate all DOM refs. Must be called once after DOMContentLoaded. */
export function initDom(): void {
  Object.assign(dom, {
    clock: getEl<HTMLCanvasElement>("clock"),
    confettiCanvas: getEl<HTMLCanvasElement>("confetti-canvas"),
    answer: getEl<HTMLInputElement>("answer"),
    submitBtn: getEl<HTMLButtonElement>("submit-btn"),
    score: getEl("score"),
    feedback: getEl("feedback"),
    timer: getEl("timer"),
    mistakes: getEl("mistakes"),
    optionsPanel: getEl("options-panel"),
    elapsed: getEl("elapsed"),
    recordBanner: getEl("record-banner"),
    nameModal: getEl("name-modal"),
    nameInput: getEl<HTMLInputElement>("name-input"),
    nameSubmitBtn: getEl<HTMLButtonElement>("name-submit-btn"),
    newRecordTime: getEl("new-record-time"),
    gameArea: getEl("game-area"),
    winScreen: getEl("win-screen"),
    loseScreen: getEl("lose-screen"),
    playAgainBtn: getEl<HTMLButtonElement>("play-again-btn"),
    tryAgainBtn: getEl<HTMLButtonElement>("try-again-btn"),
    finalScoreValue: getEl("final-score-value"),
  } satisfies DomRefs);
}
