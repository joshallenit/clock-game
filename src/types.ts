/** Mutable game state — single source of truth for all round/session data. */
export interface GameState {
  targetHours: number;
  targetMinutes: number;
  score: number;
  mistakes: number;
  remainingMs: number;
  elapsedMs: number;
  transitioning: boolean;
  timerInterval: ReturnType<typeof setInterval> | null;
  elapsedInterval: ReturnType<typeof setInterval> | null;
  /** The formatted correct answer for the current round (e.g. "7:30"). */
  correctLabel: string;
  /** Active requestAnimationFrame ID for the clock spin transition. */
  spinAnimId: number | null;

  // Timer internals (previously module-level lets in timer.ts)
  elapsedStart: number;
  roundStart: number;
  roundDuration: number;
}

/** Typed references to every DOM element the game interacts with. */
export interface DomRefs {
  clock: HTMLCanvasElement;
  confettiCanvas: HTMLCanvasElement;
  answer: HTMLInputElement;
  submitBtn: HTMLButtonElement;
  score: HTMLElement;
  feedback: HTMLElement;
  timer: HTMLElement;
  mistakes: HTMLElement;
  optionsPanel: HTMLElement;
  elapsed: HTMLElement;
  recordBanner: HTMLElement;
  nameModal: HTMLElement;
  nameInput: HTMLInputElement;
  nameSubmitBtn: HTMLButtonElement;
  newRecordTime: HTMLElement;
  gameArea: HTMLElement;
  winScreen: HTMLElement;
  loseScreen: HTMLElement;
  playAgainBtn: HTMLButtonElement;
  tryAgainBtn: HTMLButtonElement;
  finalScoreValue: HTMLElement;
}

/** A multiple-choice time answer. */
export interface TimeOption {
  h: number;
  m: number;
  label: string;
}

/** A confetti particle with velocity, spin, and fade. */
export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

/** A rain drop with downward velocity and staggered start. */
export interface RainParticle {
  x: number;
  y: number;
  vy: number;
  length: number;
  delay: number;
  life: number;
}

/** A daily speed record stored in localStorage. */
export interface DailyRecord {
  time: number;
  name: string;
}

/** Holds a cancellable requestAnimationFrame ID. */
export interface AnimRef {
  id: number | null;
}
