import {
  CLOCK_CENTER, COLORS,
  DOG_RUN_FRAMES, DOG_APPROACH_FRAMES, SAD_DOG_FRAMES,
  dom,
} from "./config.js";
import { drawClockFace } from "./clock.js";

const clockCtx = dom.clock.getContext("2d");
const fxCanvas = dom.confettiCanvas;
const fxCtx = fxCanvas.getContext("2d");
const S = 1.2; // sprite scale

let dogAnim = null;
let sadDogAnim = null;

// --- Shared animation loop ---

function runAnimation(totalFrames, animRef, drawFrame, onComplete) {
  cancelAnimationFrame(animRef.id);
  let frame = 0;

  function step() {
    frame++;
    drawFrame(frame, frame / totalFrames);

    if (frame < totalFrames) {
      animRef.id = requestAnimationFrame(step);
    } else {
      if (onComplete) onComplete();
    }
  }

  step();
}

// --- Happy dog (side view, runs across screen) ---

function drawHappyDog(c, cx, cy, facingRight) {
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
  c.fillStyle = COLORS.incorrect;
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

function launchDogHorizontal(facingRight, onComplete) {
  const screenW = fxCanvas.width;
  const screenH = fxCanvas.height;
  const startX = facingRight ? -100 : screenW + 100;
  const endX = facingRight ? screenW + 100 : -100;
  const groundY = screenH * 0.55;
  const jumpHeight = screenH * 0.3;
  const ref = { id: dogAnim };

  drawClockFace();

  runAnimation(DOG_RUN_FRAMES, ref, (frame, t) => {
    fxCtx.clearRect(0, 0, screenW, screenH);
    const x = startX + (endX - startX) * t;
    const bounceT = (t * 3) % 1;
    const y = groundY - jumpHeight * 4 * bounceT * (1 - bounceT);
    drawHappyDog(fxCtx, x, y, facingRight);
  }, () => {
    fxCtx.clearRect(0, 0, screenW, screenH);
    dogAnim = ref.id;
    if (onComplete) onComplete();
  });

  dogAnim = ref.id;
}

export function launchDog(onComplete) {
  launchDogHorizontal(true, onComplete);
}

export function launchDogReverse(onComplete) {
  launchDogHorizontal(false, onComplete);
}

// --- Front-facing dog (runs toward camera) ---

function drawFrontDog(c, cx, cy, legPhase) {
  c.save();
  c.translate(cx, cy);

  const legSwing = Math.sin(legPhase) * 12;

  // Back legs (behind body)
  c.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * 14 * S, 16 * S);
    c.rotate(side * legSwing * 0.7 * Math.PI / 180 * 3);
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
    c.rotate(side * legSwing * Math.PI / 180 * 3);
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
  c.fillStyle = COLORS.incorrect;
  c.beginPath();
  c.ellipse(3 * S, -8 * S, 4 * S, 7 * S, 0.15, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

export function launchDogApproach(onComplete) {
  const screenW = fxCanvas.width;
  const screenH = fxCanvas.height;
  const startScale = 0.3;
  const endScale = 5;
  const startY = screenH * 0.45;
  const endY = -200;
  const cx = screenW / 2;
  const ref = { id: dogAnim };

  drawClockFace();

  runAnimation(DOG_APPROACH_FRAMES, ref, (frame, t) => {
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
  }, () => {
    fxCtx.clearRect(0, 0, screenW, screenH);
    dogAnim = ref.id;
    if (onComplete) onComplete();
  });

  dogAnim = ref.id;
}

// --- Sad dog (sits on clock face and bobs head) ---

function drawSadDog(cx, cy, headBob) {
  clockCtx.save();
  clockCtx.translate(cx, cy);

  // Body
  clockCtx.fillStyle = COLORS.dog;
  clockCtx.beginPath();
  clockCtx.ellipse(0, 4 * S, 24 * S, 20 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();

  // Head
  clockCtx.beginPath();
  clockCtx.ellipse(0, -22 * S + headBob, 16 * S, 14 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();

  // Ears
  clockCtx.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    clockCtx.beginPath();
    clockCtx.ellipse(side * 14 * S, -18 * S + headBob, 7 * S, 14 * S, side * 0.4, 0, Math.PI * 2);
    clockCtx.fill();
  }

  // Half-closed eyes
  clockCtx.fillStyle = "#222";
  for (const side of [-1, 1]) {
    clockCtx.beginPath();
    clockCtx.ellipse(side * 6 * S, -24 * S + headBob, 3 * S, 1.5 * S, 0, 0, Math.PI * 2);
    clockCtx.fill();
  }

  // Sad eyebrows
  clockCtx.strokeStyle = COLORS.dogDark;
  clockCtx.lineWidth = 2 * S;
  for (const side of [-1, 1]) {
    clockCtx.beginPath();
    clockCtx.moveTo(side * 10 * S, -28 * S + headBob);
    clockCtx.lineTo(side * 3 * S, -26 * S + headBob);
    clockCtx.stroke();
  }

  // Nose
  clockCtx.fillStyle = "#333";
  clockCtx.beginPath();
  clockCtx.arc(0, -17 * S + headBob, 3 * S, 0, Math.PI * 2);
  clockCtx.fill();

  // Sad mouth
  clockCtx.strokeStyle = "#333";
  clockCtx.lineWidth = 2 * S;
  clockCtx.beginPath();
  clockCtx.arc(0, -11 * S + headBob, 5 * S, Math.PI + 0.3, Math.PI * 2 - 0.3);
  clockCtx.stroke();

  // Front paws
  clockCtx.fillStyle = COLORS.dog;
  for (const side of [-1, 1]) {
    clockCtx.beginPath();
    clockCtx.ellipse(side * 10 * S, 22 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
    clockCtx.fill();
  }

  // Drooping tail
  clockCtx.strokeStyle = COLORS.dog;
  clockCtx.lineWidth = 5 * S;
  clockCtx.lineCap = "round";
  clockCtx.beginPath();
  clockCtx.moveTo(-20 * S, 10 * S);
  clockCtx.quadraticCurveTo(-34 * S, 18 * S, -30 * S, 26 * S);
  clockCtx.stroke();

  // Tear drop
  clockCtx.fillStyle = COLORS.rain;
  clockCtx.globalAlpha = 0.7;
  clockCtx.beginPath();
  clockCtx.ellipse(10 * S, -18 * S + headBob, 2 * S, 3 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();
  clockCtx.globalAlpha = 1;

  clockCtx.restore();
}

export function launchSadDog(onComplete) {
  const ref = { id: sadDogAnim };

  runAnimation(SAD_DOG_FRAMES, ref, (frame) => {
    drawClockFace();
    const headBob = Math.sin(frame * 0.1) * 3;
    drawSadDog(CLOCK_CENTER, CLOCK_CENTER + 20, headBob);
  }, () => {
    drawClockFace();
    sadDogAnim = ref.id;
    if (onComplete) onComplete();
  });

  sadDogAnim = ref.id;
}
