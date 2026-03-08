// Elapsed timer (total game) + per-round countdown timer. All state lives in state.ts.
import { dom } from "./dom";
import { state } from "./state";
import { formatElapsed } from "./utils";
import { getTimeLimitMs } from "./difficulty";

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

function clearRoundTimeout(): void {
  if (state.roundTimeoutId !== null) {
    clearTimeout(state.roundTimeoutId);
    state.roundTimeoutId = null;
  }
  state.activeTimeoutCallback = null;
}

// When the tab becomes visible again, re-sync the authoritative timeout
// so it fires at the correct wall-clock time (browsers throttle setInterval
// and setTimeout in background tabs, which could delay the timeout).
function handleVisibilityChange(): void {
  if (document.hidden || !state.activeTimeoutCallback) return;

  const elapsed = Date.now() - state.roundStart;
  state.remainingMs = Math.max(0, state.roundDuration - elapsed);

  if (state.remainingMs <= 0) {
    clearRoundTimeout();
    const cb = state.activeTimeoutCallback;
    state.activeTimeoutCallback = null;
    cb();
  } else {
    if (state.roundTimeoutId !== null) clearTimeout(state.roundTimeoutId);
    const cb = state.activeTimeoutCallback;
    state.roundTimeoutId = setTimeout(() => {
      state.roundTimeoutId = null;
      state.activeTimeoutCallback = null;
      if (state.timerInterval) clearInterval(state.timerInterval);
      cb();
      updateTimerDisplay();
    }, state.remainingMs);
  }
  updateTimerDisplay();
}

export function setupTimerListeners(): void {
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

export function startRoundTimer(onTimeout: () => void): void {
  if (state.timerInterval) clearInterval(state.timerInterval);
  clearRoundTimeout();
  state.roundDuration = getTimeLimitMs(state.score);
  state.remainingMs = state.roundDuration;
  state.roundStart = Date.now();
  state.activeTimeoutCallback = onTimeout;
  updateTimerDisplay();
  startElapsedTimer();

  // Authoritative timeout — fires at the correct time even if setInterval drifts
  state.roundTimeoutId = setTimeout(() => {
    state.roundTimeoutId = null;
    state.activeTimeoutCallback = null;
    if (state.timerInterval) clearInterval(state.timerInterval);
    onTimeout();
    updateTimerDisplay();
  }, state.roundDuration);

  // Display-only interval for updating the countdown UI
  state.timerInterval = setInterval(() => {
    const elapsed = Date.now() - state.roundStart;
    state.remainingMs = Math.max(0, state.roundDuration - elapsed);
    updateTimerDisplay();
  }, 100);
}

export function stopRoundTimer(): void {
  if (state.timerInterval) clearInterval(state.timerInterval);
  clearRoundTimeout();
}
