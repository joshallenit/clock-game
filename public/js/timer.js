import { getTimeLimitMs, dom, state } from "./config.js";
import { formatElapsed } from "./utils.js";

// --- Elapsed timer (tracks total game time) ---

export function updateElapsedDisplay() {
  dom.elapsed.textContent = formatElapsed(state.elapsedMs);
}

let elapsedStart = 0;

export function startElapsedTimer() {
  clearInterval(state.elapsedInterval);
  elapsedStart = Date.now() - state.elapsedMs;
  state.elapsedInterval = setInterval(() => {
    state.elapsedMs = Date.now() - elapsedStart;
    updateElapsedDisplay();
  }, 100);
}

export function stopElapsedTimer() {
  clearInterval(state.elapsedInterval);
}

// --- Round timer (per-question countdown) ---

function updateTimerDisplay() {
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

let roundStart = 0;
let roundDuration = 0;

export function startRoundTimer(onTimeout) {
  clearInterval(state.timerInterval);
  roundDuration = getTimeLimitMs(state.score);
  state.remainingMs = roundDuration;
  roundStart = Date.now();
  updateTimerDisplay();
  startElapsedTimer();
  state.timerInterval = setInterval(() => {
    const elapsed = Date.now() - roundStart;
    state.remainingMs = Math.max(0, roundDuration - elapsed);
    if (state.remainingMs <= 0) {
      clearInterval(state.timerInterval);
      onTimeout();
    }
    updateTimerDisplay();
  }, 100);
}

export function stopRoundTimer() {
  clearInterval(state.timerInterval);
}
