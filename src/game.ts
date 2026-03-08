import { RULES, CLOCK, ANIM } from "./constants";
import { COLORS, onColorSchemeChange } from "./colors";
import { dom } from "./dom";
import { state } from "./state";
import { formatTime } from "./utils";
import { drawClockFace, drawHand, drawCenterDot, drawClockAt, updateClockAriaLabel } from "./clock";
import { generateOptions } from "./options";
import { launchConfetti, launchRain } from "./effects";
import { launchDog, launchDogReverse, launchDogApproach, launchSadDog } from "./dog";
import { playCorrectSound, playIncorrectSound, playWhineSound, playGameOverSound } from "./audio";
import { isNewRecord, promptForName, updateRecordBanner } from "./records";
import { updateElapsedDisplay, stopElapsedTimer, startRoundTimer, stopRoundTimer } from "./timer";

// --- Mistakes display ---

function updateMistakesDisplay(): void {
  const remaining = RULES.maxMistakes - state.mistakes;
  dom.mistakes.textContent = "\u2764\uFE0F".repeat(remaining) + "\uD83D\uDDA4".repeat(state.mistakes);
}

// --- Current round's correct answer ---

let currentCorrectLabel = "";
let spinAnim: number | null = null;

// --- Options panel ---

function disableOptions(): void {
  for (const btn of dom.optionsPanel.querySelectorAll<HTMLButtonElement>(".option-btn")) {
    btn.disabled = true;
  }
}

function renderOptions(): void {
  dom.optionsPanel.innerHTML = "";
  dom.optionsPanel.style.maxHeight = "";
  const options = generateOptions();
  currentCorrectLabel = formatTime(state.targetHours, state.targetMinutes);

  const hintBtn = document.createElement("button");
  hintBtn.className = "option-btn hint-btn";
  hintBtn.textContent = "Hint...";
  hintBtn.addEventListener("click", () => {
    state.elapsedMs += RULES.hintPenaltyMs;
    const startHeight = dom.optionsPanel.scrollHeight;
    dom.optionsPanel.style.maxHeight = startHeight + "px";
    hintBtn.remove();
    options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn reveal";
      btn.style.animationDelay = i * 0.06 + "s";
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

function pickRandomTime(): void {
  state.targetHours = Math.floor(Math.random() * 12) + 1;
  state.targetMinutes =
    state.score >= RULES.randomMinutesAt
      ? Math.floor(Math.random() * 60)
      : Math.floor(Math.random() * 12) * 5;
}

// --- Spinning hands transition ---

function spinHandsToTarget(onComplete: () => void): void {
  if (spinAnim !== null) cancelAnimationFrame(spinAnim);
  let frame = 0;

  const startMinAngle = Math.random() * Math.PI * 2;
  const startHourAngle = Math.random() * Math.PI * 2;
  const targetMinAngle = (state.targetMinutes * Math.PI) / 30 - Math.PI / 2;
  const targetHourAngle =
    (((state.targetHours % 12) + state.targetMinutes / 60) * Math.PI) / 6 - Math.PI / 2;

  let endMinAngle = targetMinAngle + Math.PI * 8;
  while (endMinAngle < startMinAngle) endMinAngle += Math.PI * 2;
  let endHourAngle = targetHourAngle + Math.PI * 4;
  while (endHourAngle < startHourAngle) endHourAngle += Math.PI * 2;

  function animate(): void {
    frame++;
    const t = frame / ANIM.spinFrames;
    const ease = 1 - Math.pow(1 - t, 5);

    const currentMin = startMinAngle + (endMinAngle - startMinAngle) * ease;
    const currentHour = startHourAngle + (endHourAngle - startHourAngle) * ease;

    drawClockFace();
    drawHand(
      currentHour,
      CLOCK.radius * CLOCK.hourHand.lengthRatio,
      CLOCK.hourHand.width,
      COLORS.text,
    );
    drawHand(
      currentMin,
      CLOCK.radius * CLOCK.minuteHand.lengthRatio,
      CLOCK.minuteHand.width,
      COLORS.accent,
    );
    drawCenterDot();

    if (frame < ANIM.spinFrames) {
      spinAnim = requestAnimationFrame(animate);
    } else {
      spinAnim = null;
      updateClockAriaLabel(state.targetHours, state.targetMinutes);
      onComplete();
    }
  }

  animate();
}

// --- Controls lock/unlock ---

function unlockControls(): void {
  state.transitioning = false;
  dom.answer.disabled = false;
  dom.submitBtn.disabled = false;
  renderOptions();
  dom.answer.focus();
  startRoundTimer(handleTimeout);
}

function lockControls(): void {
  state.transitioning = true;
  dom.answer.disabled = true;
  dom.submitBtn.disabled = true;
  disableOptions();
}

// --- Round transitions ---

const happyDogAnims = [launchDog, launchDogReverse, launchDogApproach];

function transitionToNextRound(): void {
  lockControls();
  pickRandomTime();
  const anim = happyDogAnims[Math.floor(Math.random() * happyDogAnims.length)];
  anim(() => spinHandsToTarget(unlockControls));
}

function sadDogTransition(): void {
  lockControls();
  launchSadDog(() => {
    pickRandomTime();
    spinHandsToTarget(unlockControls);
  });
}

function spinToNextRound(): void {
  lockControls();
  pickRandomTime();
  spinHandsToTarget(unlockControls);
}

// --- Handle correct answer ---

function handleCorrect(btn: HTMLButtonElement | null): void {
  if (btn) btn.classList.add("correct-pick");
  state.score++;
  stopRoundTimer();
  dom.score.textContent = `Score: ${state.score}/${RULES.winningScore}`;

  if (state.score >= RULES.winningScore) {
    showWinScreen();
    return;
  }

  dom.feedback.textContent = "\u2714 Correct!";
  dom.feedback.className = "correct";
  playCorrectSound();
  dom.answer.value = "";
  launchConfetti();
  disableOptions();
  transitionToNextRound();
}

// --- Handle mistake (shared by incorrect answer and timeout) ---

function handleMistake(feedbackText: string, btn: HTMLButtonElement | null): void {
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

  if (state.mistakes >= RULES.maxMistakes) {
    showLoseScreen();
    return;
  }

  sadDogTransition();
}

function handleIncorrect(btn: HTMLButtonElement | null): void {
  handleMistake("\u2718 Incorrect! It was " + currentCorrectLabel, btn);
}

function handleTimeout(): void {
  handleMistake("\u2718 Time's up! It was " + currentCorrectLabel, null);
}

// --- Option click handler ---

function handleOptionClick(label: string, btn: HTMLButtonElement): void {
  if (state.transitioning) return;
  if (label === currentCorrectLabel) {
    handleCorrect(btn);
  } else {
    handleIncorrect(btn);
  }
}

// --- Text input answer ---

function checkAnswer(): void {
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

function showWinScreen(): void {
  stopElapsedTimer();
  dom.gameArea.hidden = true;
  dom.winScreen.hidden = false;
  launchConfetti();
  playCorrectSound();
  dom.playAgainBtn.focus();

  let bursts = 0;
  const interval = setInterval(() => {
    bursts++;
    launchConfetti();
    if (bursts >= ANIM.winConfettiBursts) {
      clearInterval(interval);
      if (isNewRecord(state.elapsedMs)) {
        promptForName(state.elapsedMs);
      }
    }
  }, 800);
}

function showLoseScreen(): void {
  stopElapsedTimer();
  dom.gameArea.hidden = true;
  dom.finalScoreValue.textContent = String(state.score);
  dom.loseScreen.hidden = false;
  playGameOverSound();
  launchRain();
  dom.tryAgainBtn.focus();

  let waves = 0;
  const interval = setInterval(() => {
    waves++;
    launchRain();
    if (waves >= ANIM.loseRainWaves) clearInterval(interval);
  }, 1200);
}

// --- Reset ---

function resetGame(): void {
  state.score = 0;
  state.mistakes = 0;
  state.elapsedMs = 0;
  stopElapsedTimer();
  updateElapsedDisplay();
  dom.score.textContent = `Score: 0/${RULES.winningScore}`;
  updateMistakesDisplay();
  dom.feedback.textContent = "";
  dom.feedback.className = "";
  dom.winScreen.hidden = true;
  dom.loseScreen.hidden = true;
  dom.gameArea.hidden = false;
  dom.answer.value = "";
  spinToNextRound();
}

// --- Public init ---

export function initGame(): void {
  updateRecordBanner();
  updateMistakesDisplay();

  dom.submitBtn.addEventListener("click", checkAnswer);
  dom.answer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });
  dom.playAgainBtn.addEventListener("click", resetGame);
  dom.tryAgainBtn.addEventListener("click", resetGame);

  // Redraw the clock when the OS color scheme changes mid-game
  onColorSchemeChange(() => {
    if (state.targetHours > 0) {
      drawClockAt(state.targetHours, state.targetMinutes);
    }
  });

  spinToNextRound();
}
