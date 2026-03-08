import {
  WINNING_SCORE, MAX_MISTAKES, RANDOM_MINUTES_AT,
  CLOCK_RADIUS, COLORS, SPIN_FRAMES, HINT_PENALTY_MS,
  HOUR_HAND_LENGTH_RATIO, MINUTE_HAND_LENGTH_RATIO,
  HOUR_HAND_WIDTH, MINUTE_HAND_WIDTH,
  WIN_CONFETTI_BURSTS, LOSE_RAIN_WAVES,
  dom, state,
} from "./config.js";
import { formatTime } from "./utils.js";
import { drawClockFace, drawHand, drawCenterDot } from "./clock.js";
import { generateOptions } from "./options.js";
import { launchConfetti, launchRain } from "./effects.js";
import { launchDog, launchDogReverse, launchDogApproach, launchSadDog } from "./dog.js";
import { playCorrectSound, playIncorrectSound, playWhineSound, playGameOverSound } from "./audio.js";
import { isNewRecord, promptForName, updateRecordBanner } from "./records.js";
import { updateElapsedDisplay, stopElapsedTimer, startRoundTimer, stopRoundTimer } from "./timer.js";

// --- Mistakes display ---

function updateMistakesDisplay() {
  const remaining = MAX_MISTAKES - state.mistakes;
  dom.mistakes.innerHTML = "\u2764\uFE0F".repeat(remaining) + "\uD83D\uDDA4".repeat(state.mistakes);
}

// --- Current round's correct answer (single source of truth) ---

let currentCorrectLabel = "";

// --- Options panel ---

function disableOptions() {
  for (const btn of dom.optionsPanel.querySelectorAll(".option-btn")) {
    btn.disabled = true;
  }
}

function renderOptions() {
  dom.optionsPanel.innerHTML = "";
  dom.optionsPanel.style.maxHeight = "";
  const options = generateOptions();
  currentCorrectLabel = formatTime(state.targetHours, state.targetMinutes);

  const hintBtn = document.createElement("button");
  hintBtn.className = "option-btn hint-btn";
  hintBtn.textContent = "Hint...";
  hintBtn.addEventListener("click", () => {
    state.elapsedMs += HINT_PENALTY_MS;
    const startHeight = dom.optionsPanel.scrollHeight;
    dom.optionsPanel.style.maxHeight = startHeight + "px";
    hintBtn.remove();
    options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn reveal";
      btn.style.animationDelay = (i * 0.06) + "s";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => handleOptionClick(opt.label, btn));
      dom.optionsPanel.appendChild(btn);
    });
    requestAnimationFrame(() => {
      dom.optionsPanel.style.maxHeight = dom.optionsPanel.scrollHeight + "px";
    });
  });

  dom.optionsPanel.appendChild(hintBtn);
  requestAnimationFrame(() => {
    dom.optionsPanel.style.maxHeight = dom.optionsPanel.scrollHeight + "px";
  });
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
    const t = frame / SPIN_FRAMES;
    const ease = 1 - Math.pow(1 - t, 5);

    const currentMin = startMinAngle + (endMinAngle - startMinAngle) * ease;
    const currentHour = startHourAngle + (endHourAngle - startHourAngle) * ease;

    drawClockFace();
    drawHand(currentHour, CLOCK_RADIUS * HOUR_HAND_LENGTH_RATIO, HOUR_HAND_WIDTH, COLORS.text);
    drawHand(currentMin, CLOCK_RADIUS * MINUTE_HAND_LENGTH_RATIO, MINUTE_HAND_WIDTH, COLORS.accent);
    drawCenterDot();

    if (frame < SPIN_FRAMES) {
      spinAnim = requestAnimationFrame(animate);
    } else {
      if (onComplete) onComplete();
    }
  }

  animate();
}

// --- Controls lock/unlock ---

function unlockControls() {
  state.transitioning = false;
  dom.answer.disabled = false;
  dom.submitBtn.disabled = false;
  renderOptions();
  dom.answer.focus();
  startRoundTimer(handleTimeout);
}

function lockControls() {
  state.transitioning = true;
  dom.answer.disabled = true;
  dom.submitBtn.disabled = true;
  disableOptions();
}

// --- Round transitions ---

const happyDogAnims = [launchDog, launchDogReverse, launchDogApproach];

function transitionToNextRound() {
  lockControls();
  pickRandomTime();
  const dogAnim = happyDogAnims[Math.floor(Math.random() * happyDogAnims.length)];
  dogAnim(() => spinHandsToTarget(unlockControls));
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

// --- Handle correct answer ---

function handleCorrect(btn) {
  if (btn) btn.classList.add("correct-pick");
  state.score++;
  stopRoundTimer();
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

// --- Handle mistake (shared by incorrect answer and timeout) ---

function handleMistake(feedbackText, btn) {
  if (btn) {
    btn.classList.add("incorrect-pick");
    btn.disabled = true;
  }

  state.mistakes++;
  updateMistakesDisplay();

  dom.feedback.textContent = feedbackText;
  dom.feedback.className = "incorrect";
  launchRain();
  playIncorrectSound();
  playWhineSound();

  stopRoundTimer();
  dom.answer.value = "";
  disableOptions();

  if (state.mistakes >= MAX_MISTAKES) {
    showLoseScreen();
    return;
  }

  sadDogTransition();
}

function handleIncorrect(btn) {
  handleMistake("Incorrect! It was " + currentCorrectLabel, btn);
}

function handleTimeout() {
  handleMistake("Time's up! It was " + currentCorrectLabel, null);
}

// --- Option click handler ---

function handleOptionClick(label, btn) {
  if (state.transitioning) return;
  if (label === currentCorrectLabel) {
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
    if (bursts >= WIN_CONFETTI_BURSTS) {
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
    if (waves >= LOSE_RAIN_WAVES) clearInterval(interval);
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
