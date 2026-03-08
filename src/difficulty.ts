// Difficulty progression: time limits, minute precision, number visibility.
import { RULES } from "./constants";
import { randomInt } from "./utils";

/** Per-round countdown duration. Decreases as score increases. */
export function getTimeLimitMs(score: number): number {
  if (score >= 9) return 10_000;
  if (score >= 8) return 20_000;
  return Math.max(30_000, 60_000 - score * 5_000);
}

/** Pick random minutes: 5-minute increments at low scores, any minute at high scores. */
export function pickRandomMinutes(score: number): number {
  return score >= RULES.randomMinutesAt
    ? randomInt(0, 60)
    : randomInt(0, 12) * 5;
}

/** Whether to show a given hour number on the clock face at the current score. */
export function shouldShowHourNumber(score: number, hour: number): boolean {
  if (score >= RULES.hideAllNumbersAt) return false;
  if (score >= RULES.hideNonQuarterNumbersAt && hour % 3 !== 0) return false;
  return true;
}
