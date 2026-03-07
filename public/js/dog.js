import { CLOCK_SIZE, CLOCK_CENTER, COLORS, dom } from "./config.js";
import { drawClockFace } from "./clock.js";

const ctx = dom.clock.getContext("2d");
const S = 1.2; // sprite scale

let dogAnim = null;
let sadDogAnim = null;

// --- Happy dog (runs across clock on correct answer) ---

function drawHappyDog(cx, cy, facingRight) {
  ctx.save();
  ctx.translate(cx, cy);
  if (!facingRight) ctx.scale(-1, 1);

  // Body
  ctx.fillStyle = COLORS.dog;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28 * S, 18 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(26 * S, -14 * S, 16 * S, 14 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ear
  ctx.fillStyle = COLORS.dogDark;
  ctx.beginPath();
  ctx.ellipse(34 * S, -26 * S, 7 * S, 12 * S, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(32 * S, -16 * S, 3 * S, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(40 * S, -10 * S, 3 * S, 0, Math.PI * 2);
  ctx.fill();

  // Tongue
  ctx.fillStyle = COLORS.incorrect;
  ctx.beginPath();
  ctx.ellipse(38 * S, -3 * S, 3 * S, 6 * S, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Front legs
  ctx.fillStyle = COLORS.dog;
  ctx.fillRect(12 * S, 12 * S, 6 * S, 20 * S);
  ctx.fillRect(20 * S, 12 * S, 6 * S, 20 * S);

  // Back legs
  ctx.fillRect(-18 * S, 12 * S, 6 * S, 20 * S);
  ctx.fillRect(-10 * S, 12 * S, 6 * S, 20 * S);

  // Tail
  ctx.strokeStyle = COLORS.dog;
  ctx.lineWidth = 5 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-28 * S, -6 * S);
  ctx.quadraticCurveTo(-40 * S, -30 * S, -32 * S, -34 * S);
  ctx.stroke();

  ctx.restore();
}

export function launchDog(onComplete) {
  cancelAnimationFrame(dogAnim);
  const startX = -100;
  const endX = CLOCK_SIZE + 100;
  const groundY = CLOCK_SIZE * 0.6;
  const totalFrames = 140;
  let frame = 0;

  function animate() {
    drawClockFace();
    frame++;
    const t = frame / totalFrames;
    const x = startX + (endX - startX) * t;
    const bounceT = (t * 2) % 1;
    const jumpHeight = CLOCK_SIZE * 0.35;
    const y = groundY - jumpHeight * 4 * bounceT * (1 - bounceT);

    drawHappyDog(x, y, true);

    if (frame < totalFrames) {
      dogAnim = requestAnimationFrame(animate);
    } else {
      drawClockFace();
      if (onComplete) onComplete();
    }
  }

  animate();
}

// --- Sad dog (sits and bobs head on incorrect answer) ---

function drawSadDog(cx, cy, headBob) {
  ctx.save();
  ctx.translate(cx, cy);

  // Body (sitting posture)
  ctx.fillStyle = COLORS.dog;
  ctx.beginPath();
  ctx.ellipse(0, 4 * S, 24 * S, 20 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (drooped)
  ctx.beginPath();
  ctx.ellipse(0, -22 * S + headBob, 16 * S, 14 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floppy ears
  ctx.fillStyle = COLORS.dogDark;
  ctx.beginPath();
  ctx.ellipse(-14 * S, -18 * S + headBob, 7 * S, 14 * S, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(14 * S, -18 * S + headBob, 7 * S, 14 * S, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Half-closed eyes
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.ellipse(-6 * S, -24 * S + headBob, 3 * S, 1.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6 * S, -24 * S + headBob, 3 * S, 1.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sad eyebrows
  ctx.strokeStyle = COLORS.dogDark;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(-10 * S, -28 * S + headBob);
  ctx.lineTo(-3 * S, -26 * S + headBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10 * S, -28 * S + headBob);
  ctx.lineTo(3 * S, -26 * S + headBob);
  ctx.stroke();

  // Nose
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(0, -17 * S + headBob, 3 * S, 0, Math.PI * 2);
  ctx.fill();

  // Sad mouth
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.arc(0, -11 * S + headBob, 5 * S, Math.PI + 0.3, Math.PI * 2 - 0.3);
  ctx.stroke();

  // Front paws
  ctx.fillStyle = COLORS.dog;
  ctx.beginPath();
  ctx.ellipse(-10 * S, 22 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10 * S, 22 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Drooping tail
  ctx.strokeStyle = COLORS.dog;
  ctx.lineWidth = 5 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-20 * S, 10 * S);
  ctx.quadraticCurveTo(-34 * S, 18 * S, -30 * S, 26 * S);
  ctx.stroke();

  // Tear drop
  ctx.fillStyle = COLORS.rain;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(10 * S, -18 * S + headBob, 2 * S, 3 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
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
