// Shared frame-based animation loop used by dog.ts and clock.ts.
import type { AnimRef } from "./types";

/** Cancel an in-progress requestAnimationFrame loop. */
export function cancelAnimation(ref: AnimRef): void {
  if (ref.id !== null) {
    cancelAnimationFrame(ref.id);
    ref.id = null;
  }
}

/**
 * Run a fixed-length animation loop using requestAnimationFrame.
 * Cancels any previous animation on the same ref before starting.
 */
export function runFrameLoop(
  totalFrames: number,
  ref: AnimRef,
  onFrame: (frame: number, progress: number) => void,
  onComplete?: () => void,
): void {
  cancelAnimation(ref);
  let frame = 0;

  function step(): void {
    frame++;
    onFrame(frame, frame / totalFrames);

    if (frame < totalFrames) {
      ref.id = requestAnimationFrame(step);
    } else {
      ref.id = null;
      onComplete?.();
    }
  }

  step();
}
