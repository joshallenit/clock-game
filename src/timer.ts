// Elapsed timer (total game) + per-round countdown timer. All state lives in state.ts.
import { getTimeLimitMs } from "./constants";
import { dom } from "./dom";
import { state } from "./state";
import { formatElapsed } from "./utils";

// --- Elapsed timer (tracks total game time) ---

export function updateElapsedDisplay(): void {
  dom.elapsed.textContent = formatElapsed(state.elapsedMs);
}

export function startElapsedTimer(): void {
  if (state.elapsedInterval) clearInterval(state.elapsedInterval);
  state.elapsedStart = Date.now() - state.elapsedMs;
  state.elapsedInterval = setInterval(() => {
    state.elapsedMs = Date.now() - state.elapsedStart;
    updateElapsedDisplay();
  }, 100);
}

export function stopElapsedTimer(): void {
  if (state.elapsedInterval) clearInterval(state.elapsedInterval);
}

// --- Round timer (per-question countdown) ---

function updateTimerDisplay(): void {
  const totalSecs = Math.ceil(state.remainingMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  dom.timer.textContent = `${mins}:${String(secs).padStart(2, "0")}`;

  const fraction = state.remainingMs / getTimeLimitMs(state.score);
  if (fraction <= 0.25) {
    dom.timer.className = "critical";
  } else if (fraction <= 0.5) {
    dom.timer.className = "warning";
  } else {
    dom.timer.className = "";
  }
}

export function startRoundTimer(onTimeout: () => void): void {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.roundDuration = getTimeLimitMs(state.score);
  state.remainingMs = state.roundDuration;
  state.roundStart = Date.now();
  updateTimerDisplay();
  startElapsedTimer();
  state.timerInterval = setInterval(() => {
    const elapsed = Date.now() - state.roundStart;
    state.remainingMs = Math.max(0, state.roundDuration - elapsed);
    if (state.remainingMs <= 0) {
      if (state.timerInterval) clearInterval(state.timerInterval);
      onTimeout();
    }
    updateTimerDisplay();
  }, 100);
}

export function stopRoundTimer(): void {
  if (state.timerInterval) clearInterval(state.timerInterval);
}
