import type { DomRefs } from "./types";

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

const knownKeys: Record<string, true> = {
  clock: true, confettiCanvas: true, answer: true, submitBtn: true,
  score: true, feedback: true, timer: true, mistakes: true,
  optionsPanel: true, elapsed: true, recordBanner: true,
  nameModal: true, nameInput: true, nameSubmitBtn: true,
  newRecordTime: true, gameArea: true, winScreen: true,
  loseScreen: true, playAgainBtn: true, tryAgainBtn: true,
  finalScoreValue: true,
};

let initialized = false;

/** DOM refs are populated by initDom(). Accessing before init throws at the call site. */
export const dom: DomRefs = new Proxy({} as DomRefs, {
  get(target, prop, receiver) {
    if (prop in target) return Reflect.get(target, prop, receiver);
    throw new Error(`DOM not initialized: accessed dom.${String(prop)} before initDom()`);
  },
  set(target, prop, value, receiver) {
    if (!initialized) throw new Error(`DOM not initialized: cannot set dom.${String(prop)} before initDom()`);
    if (typeof prop === "string" && !(prop in knownKeys)) {
      throw new Error(`Unknown DOM ref: dom.${prop}`);
    }
    return Reflect.set(target, prop, value, receiver);
  },
});

/** Populate all DOM refs. Must be called once after DOMContentLoaded. */
export function initDom(): void {
  initialized = true;
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
