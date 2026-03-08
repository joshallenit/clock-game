import { getTimeLimitMs, dom, state } from "./config.js";

// --- Elapsed timer (tracks total game time) ---

export function updateElapsedDisplay() {
  const totalSecs = Math.floor(state.elapsedMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((state.elapsedMs % 1000) / 100);
  dom.elapsed.textContent = `${mins}:${String(secs).padStart(2, "0")}.${tenths}`;
}

export function startElapsedTimer() {
  clearInterval(state.elapsedInterval);
  state.elapsedInterval = setInterval(() => {
    state.elapsedMs += 100;
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

export function startRoundTimer(onTimeout) {
  clearInterval(state.timerInterval);
  state.remainingMs = getTimeLimitMs(state.score);
  updateTimerDisplay();
  startElapsedTimer();
  state.timerInterval = setInterval(() => {
    state.remainingMs -= 100;
    if (state.remainingMs <= 0) {
      state.remainingMs = 0;
      clearInterval(state.timerInterval);
      onTimeout();
    }
    updateTimerDisplay();
  }, 100);
}

export function stopRoundTimer() {
  clearInterval(state.timerInterval);
}
