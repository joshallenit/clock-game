export function formatTime(h: number, m: number): string {
  return h + ":" + String(m).padStart(2, "0");
}

export function formatElapsed(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return mins + ":" + String(secs).padStart(2, "0") + "." + tenths;
}

export function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error(`Failed to get 2D context for canvas#${canvas.id || "(unnamed)"}`);
  }
  return ctx;
}

/** Set up a canvas for crisp rendering on HiDPI/Retina displays. Returns the 2D context. */
export function setupHiDPICanvas(
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number,
): CanvasRenderingContext2D {
  const ctx = getContext2D(canvas);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Returns a random integer in [min, max) — min inclusive, max exclusive. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Hour hand angle in radians for the given time. 12 o'clock = -π/2. */
export function hourHandAngle(h: number, m: number): number {
  return (((h % 12) + m / 60) * Math.PI) / 6 - Math.PI / 2;
}

/** Minute hand angle in radians for the given minutes. :00 = -π/2. */
export function minuteHandAngle(m: number): number {
  return (m * Math.PI) / 30 - Math.PI / 2;
}
