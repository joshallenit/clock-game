// Win/lose screen display with celebration confetti bursts and sad rain waves.
import { ANIM } from "./constants";
import { dom } from "./dom";
import { state } from "./state";
import { launchConfetti, launchRain } from "./effects";
import { playCorrectSound, playGameOverSound } from "./audio";
import { isNewRecord, promptForName } from "./records";
import { stopElapsedTimer } from "./timer";

import type { IntervalId } from "./types";

// Rendering-only interval (not in state.ts because it's purely visual/internal)
let screenInterval: IntervalId = null;

export function stopScreenEffects(): void {
  if (screenInterval !== null) {
    clearInterval(screenInterval);
    screenInterval = null;
  }
}

export function showWinScreen(): void {
  stopElapsedTimer();
  dom.gameArea.hidden = true;
  dom.winScreen.hidden = false;
  launchConfetti();
  playCorrectSound();
  dom.playAgainBtn.focus();

  let bursts = 0;
  stopScreenEffects();
  screenInterval = setInterval(() => {
    bursts++;
    launchConfetti();
    if (bursts >= ANIM.winConfettiBursts) {
      stopScreenEffects();
      if (isNewRecord(state.elapsedMs)) {
        promptForName(state.elapsedMs);
      }
    }
  }, ANIM.winBurstIntervalMs);
}

export function showLoseScreen(): void {
  stopElapsedTimer();
  dom.gameArea.hidden = true;
  dom.finalScoreValue.textContent = String(state.score);
  dom.loseScreen.hidden = false;
  playGameOverSound();
  launchRain();
  dom.tryAgainBtn.focus();

  let waves = 0;
  stopScreenEffects();
  screenInterval = setInterval(() => {
    waves++;
    launchRain();
    if (waves >= ANIM.loseRainWaves) stopScreenEffects();
  }, ANIM.losRainIntervalMs);
}
