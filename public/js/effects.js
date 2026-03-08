import {
  CONFETTI_COLORS, COLORS,
  CONFETTI_PARTICLE_COUNT, RAIN_PARTICLE_COUNT, RAIN_SHAKE_FRAMES,
  dom,
} from "./config.js";

const canvas = dom.confettiCanvas;
const ctx = canvas.getContext("2d");

let confettiParticles = [];
let confettiAnim = null;
let rainParticles = [];
let rainAnim = null;
let rainShakeFrames = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// --- Confetti burst from screen center ---

export function launchConfetti() {
  cancelAnimationFrame(confettiAnim);
  cancelAnimationFrame(rainAnim);
  confettiParticles = [];

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 18 + 6;
    confettiParticles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 8,
      size: Math.random() * 12 + 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      life: 1,
    });
  }

  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let alive = false;

  for (const p of confettiParticles) {
    if (p.life <= 0) continue;
    alive = true;
    p.x += p.vx;
    p.vy += 0.25;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.life -= 0.008;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.restore();
  }

  if (alive) {
    confettiAnim = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// --- Sad rain with screen shake ---

export function launchRain() {
  cancelAnimationFrame(rainAnim);
  cancelAnimationFrame(confettiAnim);
  resizeCanvas();
  rainParticles = [];

  const cw = canvas.width;
  const ch = canvas.height;

  for (let i = 0; i < RAIN_PARTICLE_COUNT; i++) {
    rainParticles.push({
      x: Math.random() * cw,
      y: Math.random() * -ch,
      vy: Math.random() * 6 + 8,
      length: Math.random() * 30 + 20,
      delay: Math.random() * 40,
      life: 1,
    });
  }

  rainShakeFrames = RAIN_SHAKE_FRAMES;
  animateRain();
}

function animateRain() {
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);

  if (rainShakeFrames > 0) {
    rainShakeFrames--;
    const shakeX = (Math.random() - 0.5) * 12;
    const shakeY = (Math.random() - 0.5) * 12;
    canvas.style.transform = `translate(${shakeX}px,${shakeY}px)`;
  } else {
    canvas.style.transform = "";
  }

  let alive = false;
  let maxLife = 0;
  for (const p of rainParticles) {
    if (p.life > 0) maxLife = Math.max(maxLife, p.life);
  }
  ctx.fillStyle = `rgba(10, 10, 30, ${0.4 * Math.min(1, maxLife)})`;
  ctx.fillRect(0, 0, cw, ch);

  for (const p of rainParticles) {
    if (p.delay > 0) { p.delay--; alive = true; continue; }
    if (p.life <= 0) continue;
    alive = true;
    p.y += p.vy;
    if (p.y > ch) p.life -= 0.04;

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life) * 0.8;
    ctx.strokeStyle = COLORS.rain;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowColor = COLORS.rain;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 2, p.y + p.length);
    ctx.stroke();
    ctx.restore();
  }

  if (alive) {
    rainAnim = requestAnimationFrame(animateRain);
  } else {
    ctx.clearRect(0, 0, cw, ch);
    canvas.style.transform = "";
  }
}
