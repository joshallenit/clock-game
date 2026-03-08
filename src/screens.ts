import { ANIM } from "./constants";
import { dom } from "./dom";
import { state } from "./state";
import { launchConfetti, launchRain } from "./effects";
import { playCorrectSound, playGameOverSound } from "./audio";
import { isNewRecord, promptForName } from "./records";
import { stopElapsedTimer } from "./timer";

export function showWinScreen(): void {
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

export function showLoseScreen(): void {
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
