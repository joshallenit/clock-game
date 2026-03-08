// Win/lose screen display with celebration confetti bursts and sad rain waves.
import { ANIM } from "./constants";
import { dom } from "./dom";
import { state } from "./state";
import { launchConfetti, launchRain } from "./effects";
import { playCorrectSound, playGameOverSound } from "./audio";
import { promptForName } from "./records";
import { stopElapsedTimer } from "./timer";

export function stopScreenEffects(): void {
  if (state.screenEffectInterval !== null) {
    clearInterval(state.screenEffectInterval);
    state.screenEffectInterval = null;
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
  state.screenEffectInterval = setInterval(() => {
    bursts++;
    launchConfetti();
    if (bursts >= ANIM.winConfettiBursts) {
      stopScreenEffects();
      promptForName(state.elapsedMs);
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
  state.screenEffectInterval = setInterval(() => {
    waves++;
    launchRain();
    if (waves >= ANIM.loseRainWaves) stopScreenEffects();
  }, ANIM.loseRainIntervalMs);
}
