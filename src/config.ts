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

interface ColorPalette {
  background: string;
  panel: string;
  text: string;
  accent: string;
  muted: string;
  correct: string;
  incorrect: string;
  gold: string;
  dog: string;
  dogDark: string;
  dogChest: string;
  dogTongue: string;
  rain: string;
}

const DARK_PALETTE: ColorPalette = {
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
};

const LIGHT_PALETTE: ColorPalette = {
  background: "#f5f7fa",
  panel: "#ffffff",
  text: "#1e293b",
  accent: "#2563eb",
  muted: "#94a3b8",
  correct: "#16a34a",
  incorrect: "#dc2626",
  gold: "#d97706",
  dog: "#c4813d",
  dogDark: "#9a6530",
  dogChest: "#d4975a",
  dogTongue: "#dc2626",
  rain: "#3b82f6",
};

const DARK_CONFETTI = [
  "#4ade80", "#a2d2ff", "#f59e0b", "#e63946", "#c084fc",
  "#fb923c", "#22d3ee", "#facc15", "#f472b6",
];

const LIGHT_CONFETTI = [
  "#16a34a", "#2563eb", "#d97706", "#dc2626", "#9333ea",
  "#ea580c", "#0891b2", "#ca8a04", "#db2777",
];

export const COLORS: ColorPalette = { ...DARK_PALETTE };
export const CONFETTI_COLORS: string[] = [...DARK_CONFETTI];

/** Callbacks invoked when the color scheme changes (e.g. to redraw the clock). */
const schemeChangeListeners: Array<() => void> = [];

export function onColorSchemeChange(cb: () => void): void {
  schemeChangeListeners.push(cb);
}

function applyColorScheme(): void {
  const prefersLight =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches;
  const palette = prefersLight ? LIGHT_PALETTE : DARK_PALETTE;
  const confetti = prefersLight ? LIGHT_CONFETTI : DARK_CONFETTI;

  Object.assign(COLORS, palette);
  CONFETTI_COLORS.length = 0;
  CONFETTI_COLORS.push(...confetti);

  // Update theme-color meta tag to match current scheme
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", COLORS.background);

  for (const cb of schemeChangeListeners) cb();
}

applyColorScheme();
if (typeof window.matchMedia === "function") {
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", applyColorScheme);
}

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
