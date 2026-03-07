import {
  WINNING_SCORE, MAX_MISTAKES, RANDOM_MINUTES_AT,
  CLOCK_RADIUS, COLORS,
  getTimeLimitMs, dom, state,
} from "./config.js";
import { formatTime } from "./utils.js";
import { drawClockAt, drawClockFace, drawHand, drawCenterDot } from "./clock.js";
import { generateOptions } from "./options.js";
import { launchConfetti, launchRain } from "./effects.js";
import { launchDog, launchSadDog } from "./dog.js";
import { playCorrectSound, playIncorrectSound, playWhineSound, playGameOverSound } from "./audio.js";
import { isNewRecord, promptForName, updateRecordBanner } from "./records.js";

// --- Elapsed timer ---

function updateElapsedDisplay() {
  const totalSecs = Math.floor(state.elapsedMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((state.elapsedMs % 1000) / 100);
  dom.elapsed.textContent = `${mins}:${String(secs).padStart(2, "0")}.${tenths}`;
}

function startElapsedTimer() {
  clearInterval(state.elapsedInterval);
  state.elapsedInterval = setInterval(() => {
    state.elapsedMs += 100;
    updateElapsedDisplay();
  }, 100);
}

function stopElapsedTimer() {
  clearInterval(state.elapsedInterval);
}

// --- Round timer ---

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

function startTimer() {
  clearInterval(state.timerInterval);
  state.remainingMs = getTimeLimitMs(state.score);
  updateTimerDisplay();
  startElapsedTimer();
  state.timerInterval = setInterval(() => {
    state.remainingMs -= 100;
    if (state.remainingMs <= 0) {
      state.remainingMs = 0;
      clearInterval(state.timerInterval);
      handleTimeout();
    }
    updateTimerDisplay();
  }, 100);
}

// --- Mistakes display ---

function updateMistakesDisplay() {
  const remaining = MAX_MISTAKES - state.mistakes;
  dom.mistakes.innerHTML = "\u2764\uFE0F".repeat(remaining) + "\uD83D\uDDA4".repeat(state.mistakes);
}

// --- Options panel ---

function disableOptions() {
  for (const btn of dom.optionsPanel.querySelectorAll(".option-btn")) {
    btn.disabled = true;
  }
}

function renderOptions() {
  dom.optionsPanel.innerHTML = "";
  const options = generateOptions();
  const correctLabel = formatTime(state.targetHours, state.targetMinutes);

  for (const opt of options) {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => handleOptionClick(opt.label, correctLabel, btn));
    dom.optionsPanel.appendChild(btn);
  }
}

// --- Pick a new random time for the round ---

function pickRandomTime() {
  state.targetHours = Math.floor(Math.random() * 12) + 1;
  state.targetMinutes = state.score >= RANDOM_MINUTES_AT
    ? Math.floor(Math.random() * 60)
    : Math.floor(Math.random() * 12) * 5;
}

// --- Spinning hands transition ---

let spinAnim = null;

function spinHandsToTarget(onComplete) {
  cancelAnimationFrame(spinAnim);
  const totalFrames = 120;
  let frame = 0;

  const startMinAngle = Math.random() * Math.PI * 2;
  const startHourAngle = Math.random() * Math.PI * 2;
  const targetMinAngle = (state.targetMinutes * Math.PI) / 30 - Math.PI / 2;
  const targetHourAngle = ((state.targetHours % 12 + state.targetMinutes / 60) * Math.PI) / 6 - Math.PI / 2;

  let endMinAngle = targetMinAngle + Math.PI * 8;
  while (endMinAngle < startMinAngle) endMinAngle += Math.PI * 2;
  let endHourAngle = targetHourAngle + Math.PI * 4;
  while (endHourAngle < startHourAngle) endHourAngle += Math.PI * 2;

  function animate() {
    frame++;
    const t = frame / totalFrames;
    const ease = 1 - Math.pow(1 - t, 5); // quintic ease-out

    const currentMin = startMinAngle + (endMinAngle - startMinAngle) * ease;
    const currentHour = startHourAngle + (endHourAngle - startHourAngle) * ease;

    drawClockFace();
    drawHand(currentHour, CLOCK_RADIUS * 0.5, 6, COLORS.text);
    drawHand(currentMin, CLOCK_RADIUS * 0.7, 4, COLORS.accent);
    drawCenterDot();

    if (frame < totalFrames) {
      spinAnim = requestAnimationFrame(animate);
    } else {
      if (onComplete) onComplete();
    }
  }

  animate();
}

// --- Unlock controls after transition ---

function unlockControls() {
  state.transitioning = false;
  dom.answer.disabled = false;
  dom.submitBtn.disabled = false;
  renderOptions();
  dom.answer.focus();
  startTimer();
}

function lockControls() {
  state.transitioning = true;
  dom.answer.disabled = true;
  dom.submitBtn.disabled = true;
  disableOptions();
}

// --- Round transitions ---

function transitionToNextRound() {
  lockControls();
  pickRandomTime();
  launchDog(() => spinHandsToTarget(unlockControls));
}

function sadDogTransition() {
  lockControls();
  launchSadDog(() => {
    pickRandomTime();
    spinHandsToTarget(unlockControls);
  });
}

function spinToNextRound() {
  lockControls();
  pickRandomTime();
  spinHandsToTarget(unlockControls);
}

// --- Handle correct / incorrect / timeout ---

function handleCorrect(btn) {
  if (btn) btn.classList.add("correct-pick");
  state.score++;
  clearInterval(state.timerInterval);
  dom.score.textContent = `Score: ${state.score}/${WINNING_SCORE}`;

  if (state.score >= WINNING_SCORE) {
    showWinScreen();
    return;
  }

  dom.feedback.textContent = "Correct!";
  dom.feedback.className = "correct";
  playCorrectSound();
  dom.answer.value = "";
  launchConfetti();
  disableOptions();
  transitionToNextRound();
}

function handleIncorrect(btn) {
  if (btn) {
    btn.classList.add("incorrect-pick");
    btn.disabled = true;
  }

  state.mistakes++;
  updateMistakesDisplay();

  const correctAnswer = formatTime(state.targetHours, state.targetMinutes);
  dom.feedback.textContent = "Incorrect! It was " + correctAnswer;
  dom.feedback.className = "incorrect";
  launchRain();
  playIncorrectSound();
  playWhineSound();

  if (state.mistakes >= MAX_MISTAKES) {
    clearInterval(state.timerInterval);
    dom.answer.value = "";
    disableOptions();
    showLoseScreen();
    return;
  }

  clearInterval(state.timerInterval);
  dom.answer.value = "";
  disableOptions();
  sadDogTransition();
}

function handleTimeout() {
  state.mistakes++;
  updateMistakesDisplay();

  const correctAnswer = formatTime(state.targetHours, state.targetMinutes);
  dom.feedback.textContent = "Time's up! It was " + correctAnswer;
  dom.feedback.className = "incorrect";
  launchRain();
  playIncorrectSound();
  playWhineSound();
  dom.answer.value = "";
  disableOptions();

  if (state.mistakes >= MAX_MISTAKES) {
    showLoseScreen();
    return;
  }

  sadDogTransition();
}

// --- Option click handler ---

function handleOptionClick(label, correctLabel, btn) {
  if (state.transitioning) return;
  if (label === correctLabel) {
    handleCorrect(btn);
  } else {
    handleIncorrect(btn);
  }
}

// --- Text input answer ---

function checkAnswer() {
  if (state.transitioning) return;

  const raw = dom.answer.value.trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    dom.feedback.textContent = "Enter time as H:MM (e.g. 7:30)";
    dom.feedback.className = "incorrect";
    return;
  }

  const guessH = parseInt(match[1], 10);
  const guessM = parseInt(match[2], 10);

  if (guessH === state.targetHours && guessM === state.targetMinutes) {
    handleCorrect(null);
  } else {
    handleIncorrect(null);
  }
}

// --- Win / Lose screens ---

function showWinScreen() {
  stopElapsedTimer();
  dom.gameArea.style.display = "none";
  dom.winScreen.style.display = "flex";
  launchConfetti();
  playCorrectSound();

  let bursts = 0;
  const interval = setInterval(() => {
    bursts++;
    launchConfetti();
    if (bursts >= 5) {
      clearInterval(interval);
      if (isNewRecord(state.elapsedMs)) {
        promptForName(state.elapsedMs);
      }
    }
  }, 800);
}

function showLoseScreen() {
  stopElapsedTimer();
  dom.gameArea.style.display = "none";
  dom.finalScoreValue.textContent = state.score;
  dom.loseScreen.style.display = "flex";
  playGameOverSound();
  launchRain();

  let waves = 0;
  const interval = setInterval(() => {
    waves++;
    launchRain();
    if (waves >= 3) clearInterval(interval);
  }, 1200);
}

// --- Reset ---

function resetGame() {
  state.score = 0;
  state.mistakes = 0;
  state.elapsedMs = 0;
  stopElapsedTimer();
  updateElapsedDisplay();
  dom.score.textContent = `Score: 0/${WINNING_SCORE}`;
  updateMistakesDisplay();
  dom.feedback.textContent = "";
  dom.feedback.className = "";
  dom.winScreen.style.display = "none";
  dom.loseScreen.style.display = "none";
  dom.gameArea.style.display = "";
  dom.answer.value = "";
  spinToNextRound();
}

// --- Public init ---

export function initGame() {
  updateRecordBanner();
  updateMistakesDisplay();

  dom.submitBtn.addEventListener("click", checkAnswer);
  dom.answer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });
  dom.playAgainBtn.addEventListener("click", resetGame);
  dom.tryAgainBtn.addEventListener("click", resetGame);

  spinToNextRound();
}
