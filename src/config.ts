import type { GameState, DomRefs } from "./types";

// --- Clock canvas geometry ---

export const CLOCK = {
  size: 500,
  center: 250,
  radius: 230,
  tickOuterInset: 8,
  hourTickInnerInset: 25,
  minuteTickInnerInset: 12,
  numberInset: 45,
  hourHand: { lengthRatio: 0.5, width: 6 },
  minuteHand: { lengthRatio: 0.7, width: 4 },
  centerDotRadius: 6,
} as const;

// --- Game rules and difficulty ---

export const RULES = {
  winningScore: 10,
  maxMistakes: 5,
  optionCount: 6,
  hideNonQuarterNumbersAt: 4,
  hideAllNumbersAt: 6,
  randomMinutesAt: 7,
  hintPenaltyMs: 30_000,
} as const;

// --- Animation frame counts and effect settings ---

export const ANIM = {
  spinFrames: 120,
  dogRunFrames: 180,
  dogApproachFrames: 200,
  sadDogFrames: 120,
  confettiCount: 200,
  rainCount: 200,
  rainShakeFrames: 20,
  winConfettiBursts: 5,
  loseRainWaves: 3,
} as const;

/** Per-round countdown duration. Decreases as score increases. */
export function getTimeLimitMs(score: number): number {
  if (score >= 9) return 10_000;
  if (score >= 8) return 20_000;
  return Math.max(30_000, 60_000 - score * 5_000);
}

// --- Color palette ---
// NOTE: These values are duplicated in styles.css as CSS custom properties.
// Canvas rendering cannot use CSS variables, so keep both in sync when changing colors.

export const COLORS = {
  background: "#1a1a2e",
  panel: "#16213e",
  text: "#e2e2e2",
  accent: "#a2d2ff",
  muted: "#555",
  correct: "#4ade80",
  incorrect: "#e63946",
  gold: "#facc15",
  dog: "#c4813d",
  dogDark: "#9a6530",
  dogChest: "#d4975a",
  dogTongue: "#e63946",
  rain: "#6899cc",
} as const;

export const CONFETTI_COLORS = [
  "#4ade80",
  "#a2d2ff",
  "#f59e0b",
  "#e63946",
  "#c084fc",
  "#fb923c",
  "#22d3ee",
  "#facc15",
  "#f472b6",
] as const;

// --- DOM references (queried once at startup) ---

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

export const dom: DomRefs = {
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
};

// --- Mutable game state (single source of truth) ---

export const state: GameState = {
  targetHours: 0,
  targetMinutes: 0,
  score: 0,
  mistakes: 0,
  remainingMs: 0,
  elapsedMs: 0,
  transitioning: false,
  timerInterval: null,
  elapsedInterval: null,
};
