// Generate 6 multiple-choice time answers: correct, swapped, nearby, and random fill.
import { RULES } from "./constants";
import { state } from "./state";
import { formatTime } from "./utils";
import type { TimeOption } from "./types";

function wrapHour(h: number): number {
  return ((h - 1 + 12) % 12) + 1;
}

/** "Swapped" reading: interpret minute hand as hour, hour hand as minutes. */
function getSwappedTime(h: number, m: number): { h: number; m: number } {
  let swappedH = Math.floor(m / 5);
  if (swappedH === 0) swappedH = 12;
  const swappedM = Math.round(((h % 12) + m / 60) * 5) % 60;
  return { h: swappedH, m: swappedM };
}

function makeOption(h: number, m: number): TimeOption {
  return { h, m, label: formatTime(h, m) };
}

/** Generate 6 answer choices: correct, swapped, +/-1 hour variants, plus random fill. */
export function generateOptions(): TimeOption[] {
  const { targetHours: h, targetMinutes: m } = state;
  const swapped = getSwappedTime(h, m);

  const candidates: TimeOption[] = [
    makeOption(h, m),
    makeOption(swapped.h, swapped.m),
    makeOption(wrapHour(h + 1), m),
    makeOption(wrapHour(h - 1), m),
    makeOption(wrapHour(swapped.h + 1), swapped.m),
    makeOption(wrapHour(swapped.h - 1), swapped.m),
  ];

  // Deduplicate by label
  const seen: Record<string, boolean> = {};
  const unique: TimeOption[] = [];
  for (const opt of candidates) {
    if (!seen[opt.label]) {
      seen[opt.label] = true;
      unique.push(opt);
    }
  }

  // Fill remaining slots with random times
  while (unique.length < RULES.optionCount) {
    const rh = Math.floor(Math.random() * 12) + 1;
    const rm = Math.floor(Math.random() * 12) * 5;
    const rl = formatTime(rh, rm);
    if (!seen[rl]) {
      seen[rl] = true;
      unique.push(makeOption(rh, rm));
    }
  }

  // Fisher-Yates shuffle
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  return unique;
}
