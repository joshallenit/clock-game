// Round orchestration: pick time, lock/unlock controls, handle answers, transitions.
import { RULES, ANIM } from "./constants";
import { onColorSchemeChange } from "./colors";
import { dom } from "./dom";
import { state } from "./state";
import { formatTime, randomInt, randomChoice } from "./utils";
import { drawClockFace, drawClockAt, animateToTime } from "./clock";
import { generateOptions } from "./options";
import { pickRandomMinutes } from "./difficulty";
import { launchConfetti, launchRain } from "./effects";
import { launchDog, launchDogReverse, launchDogApproach, launchSadDog, stopDogAnimations } from "./dog";
import { playCorrectSound, playIncorrectSound, playWhineSound, ensureAudioContext } from "./audio";
import { updateRecordBanner } from "./records";
import { updateElapsedDisplay, stopElapsedTimer, startRoundTimer, stopRoundTimer, setupTimerListeners } from "./timer";
import { showWinScreen, showLoseScreen, stopScreenEffects } from "./screens";
import { setFeedback, updateMistakesDisplay, CHECK, CROSS } from "./feedback";
import { parseTimeInput } from "./input";

// --- Options panel ---

function disableOptions(): void {
  for (const btn of dom.optionsPanel.querySelectorAll<HTMLButtonElement>(".option-btn")) {
    btn.disabled = true;
  }
}

function createOptionButton(label: string, index: number): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "option-btn reveal";
  btn.style.animationDelay = index * ANIM.optionRevealStaggerSec + "s";
  btn.textContent = label;
  btn.addEventListener("click", () => handleOptionClick(label, btn));
  return btn;
}

function revealOptions(options: ReturnType<typeof generateOptions>, hintBtn: HTMLButtonElement): void {
  state.elapsedMs += RULES.hintPenaltyMs;
  const startHeight = dom.optionsPanel.scrollHeight;
  dom.optionsPanel.style.maxHeight = startHeight + "px";
  hintBtn.remove();

  for (let i = 0; i < options.length; i++) {
    dom.optionsPanel.appendChild(createOptionButton(options[i].label, i));
  }

  requestAnimationFrame(() => {
    dom.optionsPanel.style.maxHeight = dom.optionsPanel.scrollHeight + "px";
  });
}

function renderOptions(): void {
  dom.optionsPanel.innerHTML = "";
  dom.optionsPanel.style.maxHeight = "";
  const options = generateOptions();
  state.correctLabel = formatTime(state.targetHours, state.targetMinutes);

  const hintBtn = document.createElement("button");
  hintBtn.type = "button";
  hintBtn.className = "option-btn hint-btn";
  hintBtn.textContent = "Hint...";
  hintBtn.addEventListener("click", () => revealOptions(options, hintBtn));

  dom.optionsPanel.appendChild(hintBtn);
  requestAnimationFrame(() => {
    dom.optionsPanel.style.maxHeight = dom.optionsPanel.scrollHeight + "px";
  });
}

// --- Pick a new random time for the round ---

function pickRandomTime(): void {
  state.targetHours = randomInt(1, 13);
  state.targetMinutes = pickRandomMinutes(state.score);
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
  const anim = randomChoice(happyDogAnims);
  anim(drawClockFace, () => animateToTime(state.targetHours, state.targetMinutes, unlockControls));
}

function sadDogTransition(): void {
  lockControls();
  launchSadDog(drawClockFace, () => {
    pickRandomTime();
    animateToTime(state.targetHours, state.targetMinutes, unlockControls);
  });
}

function spinToNextRound(): void {
  lockControls();
  pickRandomTime();
  animateToTime(state.targetHours, state.targetMinutes, unlockControls);
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

  setFeedback(`${CHECK} Correct!`, "correct");
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

  setFeedback(feedbackText, "incorrect");
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
  handleMistake(`${CROSS} Incorrect! It was ${state.correctLabel}`, btn);
}

function handleTimeout(): void {
  handleMistake(`${CROSS} Time's up! It was ${state.correctLabel}`, null);
}

// --- Option click handler ---

function handleOptionClick(label: string, btn: HTMLButtonElement): void {
  if (state.transitioning) return;
  if (label === state.correctLabel) {
    handleCorrect(btn);
  } else {
    handleIncorrect(btn);
  }
}

// --- Text input answer ---

function checkAnswer(): void {
  if (state.transitioning) return;

  const parsed = parseTimeInput(dom.answer.value.trim());
  if (!parsed) {
    setFeedback("Enter time as H:MM (e.g. 7:30)", "incorrect");
    return;
  }

  if (parsed.h === state.targetHours && parsed.m === state.targetMinutes) {
    handleCorrect(null);
  } else {
    handleIncorrect(null);
  }
}

// --- Reset ---

function cleanupAnimations(): void {
  stopRoundTimer();
  stopScreenEffects();
  stopDogAnimations();
  if (state.spinAnimId !== null) {
    cancelAnimationFrame(state.spinAnimId);
    state.spinAnimId = null;
  }
}

function resetGame(): void {
  cleanupAnimations();
  state.score = 0;
  state.mistakes = 0;
  state.elapsedMs = 0;
  stopElapsedTimer();
  updateElapsedDisplay();
  dom.score.textContent = `Score: 0/${RULES.winningScore}`;
  updateMistakesDisplay();
  setFeedback("", "");
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
  setupTimerListeners();

  // Warm up AudioContext on first user interaction (required by iOS Safari)
  document.addEventListener("click", ensureAudioContext, { once: true });
  document.addEventListener("keydown", ensureAudioContext, { once: true });

  dom.submitBtn.addEventListener("click", checkAnswer);
  dom.answer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });
  dom.playAgainBtn.addEventListener("click", resetGame);
  dom.tryAgainBtn.addEventListener("click", resetGame);

  onColorSchemeChange(() => {
    if (state.targetHours > 0) {
      drawClockAt(state.targetHours, state.targetMinutes);
    }
  });

  spinToNextRound();
}
