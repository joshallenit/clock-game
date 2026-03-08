// Dog sprite drawing + animations: run left/right, approach camera, sad sit on clock.
import { CLOCK, ANIM, DOG } from "./constants";
import { COLORS } from "./colors";
import { dom } from "./dom";
import { getContext2D } from "./utils";
import { runFrameLoop, cancelAnimation } from "./animation";
import type { AnimRef } from "./types";

let clockCtx: CanvasRenderingContext2D;
let fxCtx: CanvasRenderingContext2D;

const S = DOG.scale;

// Rendering-only animation refs (not in state.ts because they don't affect game logic)
const dogAnim: AnimRef = { id: null };
const sadDogAnim: AnimRef = { id: null };

/** Set up canvas contexts for dog rendering. Must be called after initDom(). */
export function initDog(): void {
  clockCtx = getContext2D(dom.clock);
  fxCtx = getContext2D(dom.confettiCanvas);
}

export function stopDogAnimations(): void {
  cancelAnimation(dogAnim);
  cancelAnimation(sadDogAnim);
}

// --- Happy dog (side view, runs across screen) ---

const happy = DOG.happy;

function drawHappyDogBody(c: CanvasRenderingContext2D): void {
  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, 0, happy.body.rx * S, happy.body.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Legs
  for (const leg of [happy.legs.frontRight, happy.legs.frontLeft, happy.legs.backRight, happy.legs.backLeft]) {
    c.fillRect(leg.x * S, leg.y * S, leg.w * S, leg.h * S);
  }

  // Tail
  const t = happy.tail;
  c.strokeStyle = COLORS.dog;
  c.lineWidth = DOG.tailWidth * S;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(t.x0 * S, t.y0 * S);
  c.quadraticCurveTo(t.cpX * S, t.cpY * S, t.x1 * S, t.y1 * S);
  c.stroke();
}

function drawHappyDogHead(c: CanvasRenderingContext2D): void {
  const { head, ear, eye, nose, tongue } = happy;

  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(head.cx * S, head.cy * S, head.rx * S, head.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Ear
  c.fillStyle = COLORS.dogDark;
  c.beginPath();
  c.ellipse(ear.cx * S, ear.cy * S, ear.rx * S, ear.ry * S, ear.rotation, 0, Math.PI * 2);
  c.fill();

  // Eye
  c.fillStyle = COLORS.dogEye;
  c.beginPath();
  c.arc(eye.cx * S, eye.cy * S, eye.r * S, 0, Math.PI * 2);
  c.fill();

  // Nose
  c.fillStyle = COLORS.dogNose;
  c.beginPath();
  c.arc(nose.cx * S, nose.cy * S, nose.r * S, 0, Math.PI * 2);
  c.fill();

  // Tongue
  c.fillStyle = COLORS.dogTongue;
  c.beginPath();
  c.ellipse(tongue.cx * S, tongue.cy * S, tongue.rx * S, tongue.ry * S, tongue.rotation, 0, Math.PI * 2);
  c.fill();
}

function drawHappyDog(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facingRight: boolean,
): void {
  c.save();
  c.translate(cx, cy);
  if (!facingRight) c.scale(-1, 1);

  drawHappyDogBody(c);
  drawHappyDogHead(c);

  c.restore();
}

function launchDogHorizontal(
  facingRight: boolean,
  repaintClock: () => void,
  onComplete?: () => void,
): void {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const { offscreen, groundRatio, jumpRatio, bounces } = DOG.run;
  const startX = facingRight ? -offscreen : screenW + offscreen;
  const endX = facingRight ? screenW + offscreen : -offscreen;
  const groundY = screenH * groundRatio;
  const jumpHeight = screenH * jumpRatio;

  repaintClock();

  runFrameLoop(
    ANIM.dogRunDurationMs,
    dogAnim,
    (_elapsed, t) => {
      fxCtx.clearRect(0, 0, screenW, screenH);
      const x = startX + (endX - startX) * t;
      const bounceT = (t * bounces) % 1;
      const y = groundY - jumpHeight * 4 * bounceT * (1 - bounceT);
      drawHappyDog(fxCtx, x, y, facingRight);
    },
    () => {
      fxCtx.clearRect(0, 0, screenW, screenH);
      onComplete?.();
    },
  );
}

export function launchDog(repaintClock: () => void, onComplete?: () => void): void {
  launchDogHorizontal(true, repaintClock, onComplete);
}

export function launchDogReverse(repaintClock: () => void, onComplete?: () => void): void {
  launchDogHorizontal(false, repaintClock, onComplete);
}

// --- Front-facing dog (runs toward camera) ---

const front = DOG.front;

function drawFrontDogLegs(c: CanvasRenderingContext2D, legSwing: number): void {
  const { backLeg, frontLeg, body, chest } = front;

  // Back legs (behind body)
  c.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * backLeg.xOff * S, backLeg.y * S);
    c.rotate(((side * legSwing * backLeg.swingFactor * Math.PI) / 180) * 3);
    c.fillRect(-3 * S, 0, backLeg.w * S, backLeg.h * S);
    c.beginPath();
    c.ellipse(0, backLeg.h * S, backLeg.pawRx * S, backLeg.pawRy * S, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // Body
  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, body.cy * S, body.rx * S, body.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Front legs
  c.fillStyle = COLORS.dog;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * frontLeg.xOff * S, frontLeg.y * S);
    c.rotate(((side * legSwing * Math.PI) / 180) * 3);
    c.fillRect(-3 * S, 0, frontLeg.w * S, frontLeg.h * S);
    c.beginPath();
    c.ellipse(frontLeg.pawXOff * S, frontLeg.h * S, frontLeg.pawRx * S, frontLeg.pawRy * S, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // Chest patch
  c.fillStyle = COLORS.dogChest;
  c.beginPath();
  c.ellipse(0, chest.cy * S, chest.rx * S, chest.ry * S, 0, 0, Math.PI * 2);
  c.fill();
}

function drawFrontDogHead(c: CanvasRenderingContext2D): void {
  const { head, ear, muzzle, eye, eyeShine, nose, tongue } = front;

  // Head
  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, head.cy * S, head.rx * S, head.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Ears
  c.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * ear.xOff * S, ear.cy * S, ear.rx * S, ear.ry * S, side * ear.rotation, 0, Math.PI * 2);
    c.fill();
  }

  // Muzzle
  c.fillStyle = COLORS.dogChest;
  c.beginPath();
  c.ellipse(0, muzzle.cy * S, muzzle.rx * S, muzzle.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Eyes
  c.fillStyle = COLORS.dogEye;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.arc(side * eye.xOff * S, eye.cy * S, eye.r * S, 0, Math.PI * 2);
    c.fill();
  }

  // Eye shine
  c.fillStyle = COLORS.eyeShine;
  c.beginPath();
  c.arc(eyeShine.leftX * S, eyeShine.cy * S, eyeShine.r * S, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(eyeShine.rightX * S, eyeShine.cy * S, eyeShine.r * S, 0, Math.PI * 2);
  c.fill();

  // Nose
  c.fillStyle = COLORS.dogEye;
  c.beginPath();
  c.ellipse(0, nose.cy * S, nose.rx * S, nose.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Tongue
  c.fillStyle = COLORS.dogTongue;
  c.beginPath();
  c.ellipse(tongue.cx * S, tongue.cy * S, tongue.rx * S, tongue.ry * S, tongue.rotation, 0, Math.PI * 2);
  c.fill();
}

function drawFrontDog(c: CanvasRenderingContext2D, cx: number, cy: number, legPhase: number): void {
  c.save();
  c.translate(cx, cy);

  const legSwing = Math.sin(legPhase) * front.legSwingAmplitude;
  drawFrontDogLegs(c, legSwing);
  drawFrontDogHead(c);

  c.restore();
}

export function launchDogApproach(repaintClock: () => void, onComplete?: () => void): void {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const app = DOG.approach;
  const startY = screenH * app.startYRatio;
  const cx = screenW / 2;

  repaintClock();

  runFrameLoop(
    ANIM.dogApproachDurationMs,
    dogAnim,
    (_elapsed, t) => {
      fxCtx.clearRect(0, 0, screenW, screenH);
      const ease = t * t;
      const scale = app.startScale + (app.endScale - app.startScale) * ease;
      const baseY = startY + (app.endY - startY) * ease;
      const bounceT = (t * app.bounces) % 1;
      const bounceHeight = 12 * scale * app.bounceScale;
      const y = baseY - bounceHeight * 4 * bounceT * (1 - bounceT);
      const legPhase = t * app.legSpeed;

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

const sad = DOG.sad;

function drawSadDogBody(c: CanvasRenderingContext2D): void {
  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, sad.body.cy * S, sad.body.rx * S, sad.body.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Front paws
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * sad.paw.xOff * S, sad.paw.cy * S, sad.paw.rx * S, sad.paw.ry * S, 0, 0, Math.PI * 2);
    c.fill();
  }

  // Drooping tail
  const t = sad.tail;
  c.strokeStyle = COLORS.dog;
  c.lineWidth = DOG.tailWidth * S;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(t.x0 * S, t.y0 * S);
  c.quadraticCurveTo(t.cpX * S, t.cpY * S, t.x1 * S, t.y1 * S);
  c.stroke();
}

function drawSadDogHead(c: CanvasRenderingContext2D, headBob: number): void {
  const { head, ear, eye, eyebrow, nose, mouth, tear } = sad;

  c.fillStyle = COLORS.dog;
  c.beginPath();
  c.ellipse(0, head.cy * S + headBob, head.rx * S, head.ry * S, 0, 0, Math.PI * 2);
  c.fill();

  // Ears
  c.fillStyle = COLORS.dogDark;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * ear.xOff * S, ear.cy * S + headBob, ear.rx * S, ear.ry * S, side * ear.rotation, 0, Math.PI * 2);
    c.fill();
  }

  // Half-closed eyes
  c.fillStyle = COLORS.dogEye;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(side * eye.xOff * S, eye.cy * S + headBob, eye.rx * S, eye.ry * S, 0, 0, Math.PI * 2);
    c.fill();
  }

  // Sad eyebrows
  c.strokeStyle = COLORS.dogDark;
  c.lineWidth = DOG.thinLine * S;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.moveTo(side * eyebrow.outerX * S, eyebrow.outerY * S + headBob);
    c.lineTo(side * eyebrow.innerX * S, eyebrow.innerY * S + headBob);
    c.stroke();
  }

  // Nose
  c.fillStyle = COLORS.dogNose;
  c.beginPath();
  c.arc(0, nose.cy * S + headBob, nose.r * S, 0, Math.PI * 2);
  c.fill();

  // Sad mouth
  c.strokeStyle = COLORS.dogNose;
  c.lineWidth = DOG.thinLine * S;
  c.beginPath();
  c.arc(0, mouth.cy * S + headBob, mouth.r * S, Math.PI + mouth.arcInset, Math.PI * 2 - mouth.arcInset);
  c.stroke();

  // Tear drop
  c.fillStyle = COLORS.rain;
  c.globalAlpha = tear.alpha;
  c.beginPath();
  c.ellipse(tear.x * S, tear.cy * S + headBob, tear.rx * S, tear.ry * S, 0, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1;
}

function drawSadDog(c: CanvasRenderingContext2D, cx: number, cy: number, headBob: number): void {
  c.save();
  c.translate(cx, cy);

  drawSadDogBody(c);
  drawSadDogHead(c, headBob);

  c.restore();
}

export function launchSadDog(repaintClock: () => void, onComplete?: () => void): void {
  runFrameLoop(
    ANIM.sadDogDurationMs,
    sadDogAnim,
    (elapsed) => {
      repaintClock();
      const headBob = Math.sin(elapsed * sad.headBobSpeed) * sad.headBobAmplitude;
      drawSadDog(clockCtx, CLOCK.center, CLOCK.center + sad.seatY, headBob);
    },
    () => {
      repaintClock();
      onComplete?.();
    },
  );
}
