import type { GameState } from "./types";

/** Mutable game state - single source of truth for all round/session data. */
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
