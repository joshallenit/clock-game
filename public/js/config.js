// Canvas dimensions
export const CLOCK_SIZE = 500;
export const CLOCK_CENTER = CLOCK_SIZE / 2;
export const CLOCK_RADIUS = CLOCK_CENTER - 20;

// Game rules
export const WINNING_SCORE = 10;
export const MAX_MISTAKES = 5;
export const OPTION_COUNT = 6;

// Difficulty thresholds (score-based)
export const HIDE_NON_QUARTER_NUMBERS_AT = 4;  // only show 3, 6, 9, 12
export const HIDE_ALL_NUMBERS_AT = 6;           // no numbers on clock face
export const RANDOM_MINUTES_AT = 7;             // non-5-minute intervals

// Timer durations (milliseconds)
export function getTimeLimitMs(score) {
  if (score >= 9) return 10000;
  if (score >= 8) return 20000;
  return Math.max(30000, 60000 - score * 5000);
}

// Animation frame counts
export const SPIN_FRAMES = 120;
export const DOG_RUN_FRAMES = 180;
export const DOG_APPROACH_FRAMES = 200;
export const SAD_DOG_FRAMES = 120;
export const HINT_PENALTY_MS = 30000;
export const CONFETTI_PARTICLE_COUNT = 200;
export const RAIN_PARTICLE_COUNT = 200;
export const RAIN_SHAKE_FRAMES = 20;
export const WIN_CONFETTI_BURSTS = 5;
export const LOSE_RAIN_WAVES = 3;

// Colors
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
  rain: "#6899cc",
};

// Confetti palette
export const CONFETTI_COLORS = [
  "#4ade80", "#a2d2ff", "#f59e0b", "#e63946",
  "#c084fc", "#fb923c", "#22d3ee", "#facc15", "#f472b6",
];

// DOM element references (initialized once on import)
export const dom = {
  clock: document.getElementById("clock"),
  confettiCanvas: document.getElementById("confetti-canvas"),
  answer: document.getElementById("answer"),
  submitBtn: document.getElementById("submit-btn"),
  score: document.getElementById("score"),
  feedback: document.getElementById("feedback"),
  timer: document.getElementById("timer"),
  mistakes: document.getElementById("mistakes"),
  optionsPanel: document.getElementById("options-panel"),
  elapsed: document.getElementById("elapsed"),
  recordBanner: document.getElementById("record-banner"),
  nameModal: document.getElementById("name-modal"),
  nameInput: document.getElementById("name-input"),
  nameSubmitBtn: document.getElementById("name-submit-btn"),
  newRecordTime: document.getElementById("new-record-time"),
  gameArea: document.getElementById("game-area"),
  winScreen: document.getElementById("win-screen"),
  loseScreen: document.getElementById("lose-screen"),
  playAgainBtn: document.getElementById("play-again-btn"),
  tryAgainBtn: document.getElementById("try-again-btn"),
  finalScoreValue: document.getElementById("final-score-value"),
};

// Mutable game state (single source of truth)
export const state = {
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
