import { CLOCK_SIZE, CLOCK_CENTER, COLORS, dom } from "./config.js";
import { drawClockFace } from "./clock.js";

const clockCtx = dom.clock.getContext("2d");
const fxCanvas = dom.confettiCanvas;
const fxCtx = fxCanvas.getContext("2d");
const S = 1.2; // sprite scale

let dogAnim = null;
let sadDogAnim = null;

// --- Happy dog (runs across clock on correct answer) ---

function drawHappyDog(c, cx, cy, facingRight) {
  c.save();
  c.translate(cx, cy);
  if (!facingRight) c.scale(-1, 1);

  // Body
  c.fillStyle = COLORS.dog;
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

  // Front legs
  c.fillStyle = COLORS.dog;
  c.fillRect(12 * S, 12 * S, 6 * S, 20 * S);
  c.fillRect(20 * S, 12 * S, 6 * S, 20 * S);

  // Back legs
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

export function launchDog(onComplete) {
  cancelAnimationFrame(dogAnim);
  const screenW = fxCanvas.width;
  const screenH = fxCanvas.height;
  const startX = -100;
  const endX = screenW + 100;
  const groundY = screenH * 0.55;
  const jumpHeight = screenH * 0.3;
  const totalFrames = 180;
  let frame = 0;

  drawClockFace();

  function animate() {
    fxCtx.clearRect(0, 0, screenW, screenH);
    frame++;
    const t = frame / totalFrames;
    const x = startX + (endX - startX) * t;
    const bounceT = (t * 3) % 1;
    const y = groundY - jumpHeight * 4 * bounceT * (1 - bounceT);

    drawHappyDog(fxCtx, x, y, true);

    if (frame < totalFrames) {
      dogAnim = requestAnimationFrame(animate);
    } else {
      fxCtx.clearRect(0, 0, screenW, screenH);
      if (onComplete) onComplete();
    }
  }

  animate();
}

// --- Sad dog (sits and bobs head on incorrect answer) ---

function drawSadDog(cx, cy, headBob) {
  clockCtx.save();
  clockCtx.translate(cx, cy);

  // Body (sitting posture)
  clockCtx.fillStyle = COLORS.dog;
  clockCtx.beginPath();
  clockCtx.ellipse(0, 4 * S, 24 * S, 20 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();

  // Head (drooped)
  clockCtx.beginPath();
  clockCtx.ellipse(0, -22 * S + headBob, 16 * S, 14 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();

  // Floppy ears
  clockCtx.fillStyle = COLORS.dogDark;
  clockCtx.beginPath();
  clockCtx.ellipse(-14 * S, -18 * S + headBob, 7 * S, 14 * S, -0.4, 0, Math.PI * 2);
  clockCtx.fill();
  clockCtx.beginPath();
  clockCtx.ellipse(14 * S, -18 * S + headBob, 7 * S, 14 * S, 0.4, 0, Math.PI * 2);
  clockCtx.fill();

  // Half-closed eyes
  clockCtx.fillStyle = "#222";
  clockCtx.beginPath();
  clockCtx.ellipse(-6 * S, -24 * S + headBob, 3 * S, 1.5 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();
  clockCtx.beginPath();
  clockCtx.ellipse(6 * S, -24 * S + headBob, 3 * S, 1.5 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();

  // Sad eyebrows
  clockCtx.strokeStyle = COLORS.dogDark;
  clockCtx.lineWidth = 2 * S;
  clockCtx.beginPath();
  clockCtx.moveTo(-10 * S, -28 * S + headBob);
  clockCtx.lineTo(-3 * S, -26 * S + headBob);
  clockCtx.stroke();
  clockCtx.beginPath();
  clockCtx.moveTo(10 * S, -28 * S + headBob);
  clockCtx.lineTo(3 * S, -26 * S + headBob);
  clockCtx.stroke();

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
  clockCtx.beginPath();
  clockCtx.ellipse(-10 * S, 22 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();
  clockCtx.beginPath();
  clockCtx.ellipse(10 * S, 22 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
  clockCtx.fill();

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
  cancelAnimationFrame(sadDogAnim);
  const totalFrames = 120;
  let frame = 0;

  function animate() {
    drawClockFace();
    frame++;
    const headBob = Math.sin(frame * 0.1) * 3;
    drawSadDog(CLOCK_CENTER, CLOCK_CENTER + 20, headBob);

    if (frame < totalFrames) {
      sadDogAnim = requestAnimationFrame(animate);
    } else {
      drawClockFace();
      if (onComplete) onComplete();
    }
  }

  animate();
}
