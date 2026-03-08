// Text input parsing for typed time answers.

/** Parse a "H:MM" string into hour/minute, or null if invalid. */
export function parseTimeInput(raw: string): { h: number; m: number } | null {
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  return { h, m };
}
