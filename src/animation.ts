// Shared time-based animation loop used by dog.ts and clock.ts.
import type { AnimRef } from "./types";

/** Cancel an in-progress requestAnimationFrame loop. */
export function cancelAnimation(ref: AnimRef): void {
  if (ref.id !== null) {
    cancelAnimationFrame(ref.id);
    ref.id = null;
  }
}

/**
 * Run a time-based animation loop using requestAnimationFrame.
 * Cancels any previous animation on the same ref before starting.
 *
 * Unlike a frame-count loop, this uses wall-clock time so animations
 * run at the same speed regardless of display refresh rate (60 Hz vs 120 Hz).
 */
export function runFrameLoop(
  durationMs: number,
  ref: AnimRef,
  onFrame: (elapsedMs: number, progress: number) => void,
  onComplete?: () => void,
): void {
  cancelAnimation(ref);
  const startTime = performance.now();

  function finish(): void {
    ref.id = null;
    onComplete?.();
  }

  function step(): void {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / durationMs, 1);

    try {
      onFrame(elapsed, progress);
    } catch (e) {
      console.error("Animation frame error:", e);
      finish();
      return;
    }

    if (progress < 1) {
      ref.id = requestAnimationFrame(step);
    } else {
      finish();
    }
  }

  step();
}
