import { CLOCK, ANIM } from "./constants";
import { COLORS } from "./colors";
import { dom } from "./dom";
import { getContext2D } from "./utils";
import { drawClockFace } from "./clock";
import type { AnimRef } from "./types";

const clockCtx = getContext2D(dom.clock);
const fxCanvas = dom.confettiCanvas;
const fxCtx = getContext2D(fxCanvas);

const S = 1.2; // sprite scale factor

const dogAnim: AnimRef = { id: null };
const sadDogAnim: AnimRef = { id: null };

// --- Shared animation loop ---

function runAnimation(
  totalFrames: number,
  ref: AnimRef,
  drawFrame: (frame: number, progress: number) => void,
  onComplete?: () => void,
): void {
  if (ref.id !== null) cancelAnimationFrame(ref.id);
  let frame = 0;

  function step(): void {
    frame++;
    drawFrame(frame, frame / totalFrames);

    if (frame < totalFrames) {
      ref.id = requestAnimationFrame(step);
    } else {
      ref.id = null;
      onComplete?.();
    }
  }

  step();
}

// --- Happy dog (side view, runs across screen) ---

function drawHappyDog(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facingRight: boolean,
): void {
  c.save();
  c.translate(cx, cy);
  if (!facingRight) c.scale(-1, 1);

  c.fillStyle = COLORS.dog;

  // Body
  c.beginPath();
  c.ellipse(0, 0, 28 * S, 18 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Head
  c.beginPath();
  c.ellipse(26 * S, -14 * S, 16 * S, 14 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Ear
  c.fillStyle = COLORS.dogDark;
  c.beginPath();
  c.ellipse(34 * S, -26 * S, 7 * S, 12 * S, 0.3, 0, Math.PI * 2);
  c.fill();

  // Eye
  c.fillStyle = "#222";
  c.beginPath();
  c.arc(32 * S, -16 * S, 3 * S, 0, Math.PI * 2);
  c.fill();

  // Nose
  c.fillStyle = "#333";
  c.beginPath();
  c.arc(40 * S, -10 * S, 3 * S, 0, Math.PI * 2);
  c.fill();

  // Tongue
  c.fillStyle = COLORS.dogTongue;
  c.beginPath();
  c.ellipse(38 * S, -3 * S, 3 * S, 6 * S, 0.2, 0, Math.PI * 2);
  c.fill();

  // Legs
  c.fillStyle = COLORS.dog;
  c.fillRect(12 * S, 12 * S, 6 * S, 20 * S);
  c.fillRect(20 * S, 12 * S, 6 * S, 20 * S);
  c.fillRect(-18 * S, 12 * S, 6 * S, 20 * S);
  c.fillRect(-10 * S, 12 * S, 6 * S, 20 * S);

  // Tail
  c.strokeStyle = COLORS.dog;
  c.lineWidth = 5 * S;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(-28 * S, -6 * S);
  c.quadraticCurveTo(-40 * S, -30 * S, -32 * S, -34 * S);
  c.stroke();

  c.restore();
}

function launchDogHorizontal(facingRight: boolean, onComplete?: () => void): void {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const startX = facingRight ? -100 : screenW + 100;
  const endX = facingRight ? screenW + 100 : -100;
  const groundY = screenH * 0.55;
  const jumpHeight = screenH * 0.3;

  drawClockFace();

  runAnimation(
    ANIM.dogRunFrames,
    dogAnim,
    (_frame, t) => {
      fxCtx.clearRect(0, 0, screenW, screenH);
      const x = startX + (endX - startX) * t;
      const bounceT = (t * 3) % 1;
      const y = groundY - jumpHeight * 4 * bounceT * (1 - bounceT);
      drawHappyDog(fxCtx, x, y, facingRight);
    },
    () => {
      fxCtx.clearRect(0, 0, screenW, screenH);
      onComplete?.();
    },
  );
}

export function launchDog(onComplete?: () => void): void {
  launchDogHorizontal(true, onComplete);
}

export function launchDogReverse(onComplete?: () => void): void {
  launchDogHorizontal(false, onComplete);
}

// --- Front-facing dog (runs toward camera) ---

function drawFrontDog(c: CanvasRenderingContext2D, cx: number, cy: number, legPhase: number): void {
  c.save();
  c.translate(cx, cy);

  const legSwing = Math.sin(legPhase) * 12;

  // Back legs (behind body)
  c.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * 14 * S, 16 * S);
    c.rotate(((side * legSwing * 0.7 * Math.PI) / 180) * 3);
    c.fillRect(-3 * S, 0, 6 * S, 22 * S);
    c.beginPath();
    c.ellipse(0, 22 * S, 5 * S, 3 * S, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // Body
  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, 4 * S, 24 * S, 20 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Front legs
  c.fillStyle = COLORS.dog;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * 10 * S, 16 * S);
    c.rotate(((side * legSwing * Math.PI) / 180) * 3);
    c.fillRect(-3 * S, 0, 7 * S, 20 * S);
    c.beginPath();
    c.ellipse(0.5 * S, 20 * S, 5 * S, 3.5 * S, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // Chest patch
  c.fillStyle = COLORS.dogChest;
  c.beginPath();
  c.ellipse(0, 8 * S, 12 * S, 10 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Head
  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, -20 * S, 18 * S, 16 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Ears
  c.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * 18 * S, -16 * S, 8 * S, 14 * S, side * 0.3, 0, Math.PI * 2);
    c.fill();
  }

  // Muzzle
  c.fillStyle = COLORS.dogChest;
  c.beginPath();
  c.ellipse(0, -14 * S, 10 * S, 8 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Eyes
  c.fillStyle = "#222";
  for (const side of [-1, 1]) {
    c.beginPath();
    c.arc(side * 7 * S, -24 * S, 3.5 * S, 0, Math.PI * 2);
    c.fill();
  }

  // Eye shine
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(-5.5 * S, -25.5 * S, 1.2 * S, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(8.5 * S, -25.5 * S, 1.2 * S, 0, Math.PI * 2);
  c.fill();

  // Nose
  c.fillStyle = "#222";
  c.beginPath();
  c.ellipse(0, -15 * S, 4 * S, 3 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Tongue
  c.fillStyle = COLORS.dogTongue;
  c.beginPath();
  c.ellipse(3 * S, -8 * S, 4 * S, 7 * S, 0.15, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

export function launchDogApproach(onComplete?: () => void): void {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const startScale = 0.3;
  const endScale = 5;
  const startY = screenH * 0.45;
  const endY = -200;
  const cx = screenW / 2;

  drawClockFace();

  runAnimation(
    ANIM.dogApproachFrames,
    dogAnim,
    (_frame, t) => {
      fxCtx.clearRect(0, 0, screenW, screenH);
      const ease = t * t;
      const scale = startScale + (endScale - startScale) * ease;
      const baseY = startY + (endY - startY) * ease;
      const bounceT = (t * 10) % 1;
      const bounceHeight = 12 * scale * 0.3;
      const y = baseY - bounceHeight * 4 * bounceT * (1 - bounceT);
      const legPhase = t * 45;

      fxCtx.save();
      fxCtx.translate(cx, y);
      fxCtx.scale(scale, scale);
      fxCtx.translate(-cx, -y);
      drawFrontDog(fxCtx, cx, y, legPhase);
      fxCtx.restore();
    },
    () => {
      fxCtx.clearRect(0, 0, screenW, screenH);
      onComplete?.();
    },
  );
}

// --- Sad dog (sits on clock face and bobs head) ---

function drawSadDog(c: CanvasRenderingContext2D, cx: number, cy: number, headBob: number): void {
  c.save();
  c.translate(cx, cy);

  // Body
  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, 4 * S, 24 * S, 20 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Head
  c.beginPath();
  c.ellipse(0, -22 * S + headBob, 16 * S, 14 * S, 0, 0, Math.PI * 2);
  c.fill();

  // Ears
  c.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * 14 * S, -18 * S + headBob, 7 * S, 14 * S, side * 0.4, 0, Math.PI * 2);
    c.fill();
  }

  // Half-closed eyes
  c.fillStyle = "#222";
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * 6 * S, -24 * S + headBob, 3 * S, 1.5 * S, 0, 0, Math.PI * 2);
    c.fill();
  }

  // Sad eyebrows
  c.strokeStyle = COLORS.dogDark;
  c.lineWidth = 2 * S;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.moveTo(side * 10 * S, -28 * S + headBob);
    c.lineTo(side * 3 * S, -26 * S + headBob);
    c.stroke();
  }

  // Nose
  c.fillStyle = "#333";
  c.beginPath();
  c.arc(0, -17 * S + headBob, 3 * S, 0, Math.PI * 2);
  c.fill();

  // Sad mouth
  c.strokeStyle = "#333";
  c.lineWidth = 2 * S;
  c.beginPath();
  c.arc(0, -11 * S + headBob, 5 * S, Math.PI + 0.3, Math.PI * 2 - 0.3);
  c.stroke();

  // Front paws
  c.fillStyle = COLORS.dog;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * 10 * S, 22 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
    c.fill();
  }

  // Drooping tail
  c.strokeStyle = COLORS.dog;
  c.lineWidth = 5 * S;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(-20 * S, 10 * S);
  c.quadraticCurveTo(-34 * S, 18 * S, -30 * S, 26 * S);
  c.stroke();

  // Tear drop
  c.fillStyle = COLORS.rain;
  c.globalAlpha = 0.7;
  c.beginPath();
  c.ellipse(10 * S, -18 * S + headBob, 2 * S, 3 * S, 0, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1;

  c.restore();
}

export function launchSadDog(onComplete?: () => void): void {
  runAnimation(
    ANIM.sadDogFrames,
    sadDogAnim,
    (frame) => {
      drawClockFace();
      const headBob = Math.sin(frame * 0.1) * 3;
      drawSadDog(clockCtx, CLOCK.center, CLOCK.center + 20, headBob);
    },
    () => {
      drawClockFace();
      onComplete?.();
    },
  );
}
