import { OPTION_COUNT, state } from "./config.js";
import { formatTime } from "./utils.js";

// Keep hour in 1-12 range
function wrapHour(h) {
  return ((h - 1 + 12) % 12) + 1;
}

// "Swapped" reading: interpret minute hand as hour, hour hand as minutes
function getSwappedTime(h, m) {
  let swappedH = Math.floor(m / 5);
  if (swappedH === 0) swappedH = 12;
  const swappedM = Math.round(((h % 12) + m / 60) * 5) % 60;
  return { h: swappedH, m: swappedM };
}

function makeOption(h, m) {
  return { h, m, label: formatTime(h, m) };
}

// Generate 6 answer choices: correct, swapped, +/-1 hour variants, plus random fill
export function generateOptions() {
  const { targetHours: h, targetMinutes: m } = state;
  const swapped = getSwappedTime(h, m);

  const candidates = [
    makeOption(h, m),                           // correct
    makeOption(swapped.h, swapped.m),            // swapped reading
    makeOption(wrapHour(h + 1), m),              // correct +1h
    makeOption(wrapHour(h - 1), m),              // correct -1h
    makeOption(wrapHour(swapped.h + 1), swapped.m), // swapped +1h
    makeOption(wrapHour(swapped.h - 1), swapped.m), // swapped -1h
  ];

  // Deduplicate by label
  const seen = {};
  const unique = [];
  for (const opt of candidates) {
    if (!seen[opt.label]) {
      seen[opt.label] = true;
      unique.push(opt);
    }
  }

  // Fill remaining slots with random times
  while (unique.length < OPTION_COUNT) {
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
