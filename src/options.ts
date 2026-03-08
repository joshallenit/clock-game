// Generate 6 multiple-choice time answers: correct, swapped, nearby, and random fill.
import { RULES } from "./constants";
import { formatTime, randomInt } from "./utils";
import { pickRandomMinutes } from "./difficulty";
import type { TimeOption } from "./types";

function wrapHour(h: number): number {
  return ((h - 1 + 12) % 12) + 1;
}

/** "Swapped" reading: interpret minute hand as hour, hour hand as minutes. */
export function getSwappedTime(h: number, m: number): { h: number; m: number } {
  let swappedH = Math.floor(m / 5);
  if (swappedH === 0) swappedH = 12;
  const swappedM = Math.round(((h % 12) + m / 60) * 5) % 60;
  return { h: swappedH, m: swappedM };
}

function makeOption(h: number, m: number): TimeOption {
  return { h, m, label: formatTime(h, m) };
}

function deduplicateByLabel(candidates: TimeOption[]): TimeOption[] {
  const seen = new Set<string>();
  const unique: TimeOption[] = [];
  for (const opt of candidates) {
    if (!seen.has(opt.label)) {
      seen.add(opt.label);
      unique.push(opt);
    }
  }
  return unique;
}

function fillWithRandomTimes(options: TimeOption[], score: number): TimeOption[] {
  const seen = new Set(options.map((o) => o.label));
  while (options.length < RULES.optionCount) {
    const rh = randomInt(1, 13);
    const rm = pickRandomMinutes(score);
    const rl = formatTime(rh, rm);
    if (!seen.has(rl)) {
      seen.add(rl);
      options.push(makeOption(rh, rm));
    }
  }
  return options;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate 6 answer choices: correct, swapped, +/-1 hour variants, plus random fill. */
export function generateOptions(h: number, m: number, score: number): TimeOption[] {
  const swapped = getSwappedTime(h, m);

  const candidates: TimeOption[] = [
    makeOption(h, m),
    makeOption(swapped.h, swapped.m),
    makeOption(wrapHour(h + 1), m),
    makeOption(wrapHour(h - 1), m),
    makeOption(wrapHour(swapped.h + 1), swapped.m),
    makeOption(wrapHour(swapped.h - 1), swapped.m),
  ];

  return shuffle(fillWithRandomTimes(deduplicateByLabel(candidates), score));
}
