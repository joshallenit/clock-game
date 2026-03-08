import {
  CONFETTI_COLORS, COLORS,
  CONFETTI_PARTICLE_COUNT, RAIN_PARTICLE_COUNT, RAIN_SHAKE_FRAMES,
  dom,
} from "./config.js";

const canvas = dom.confettiCanvas;
const ctx = canvas.getContext("2d");

let confettiAnim = null;
let rainAnim = null;
let rainShakeFrames = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// --- Shared particle animation loop ---
// beforeDraw is called once per frame (optional), updateParticle per particle.
// Returns true from updateParticle if particle is still alive.

function runParticleLoop({ particles, animId, cancelId, beforeDraw, updateParticle, onDone }) {
  cancelAnimationFrame(animId.value);
  cancelAnimationFrame(cancelId.value);

  function step() {
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    if (beforeDraw) beforeDraw(particles, cw, ch);

    let alive = false;
    for (const p of particles) {
      if (updateParticle(p, cw, ch)) alive = true;
    }

    if (alive) {
      animId.value = requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, cw, ch);
      if (onDone) onDone();
    }
  }

  step();
}

// --- Confetti burst from screen center ---

export function launchConfetti() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const particles = [];
  for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 18 + 6;
    particles.push({
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

  const confettiId = { get value() { return confettiAnim; }, set value(v) { confettiAnim = v; } };
  const rainId = { get value() { return rainAnim; }, set value(v) { rainAnim = v; } };

  runParticleLoop({
    particles,
    animId: confettiId,
    cancelId: rainId,
    updateParticle(p) {
      if (p.life <= 0) return false;
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
      return true;
    },
  });
}

// --- Sad rain with screen shake ---

export function launchRain() {
  resizeCanvas();

  const cw = canvas.width;
  const ch = canvas.height;

  const particles = [];
  for (let i = 0; i < RAIN_PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * cw,
      y: Math.random() * -ch,
      vy: Math.random() * 6 + 8,
      length: Math.random() * 30 + 20,
      delay: Math.random() * 40,
      life: 1,
    });
  }

  rainShakeFrames = RAIN_SHAKE_FRAMES;

  const rainId = { get value() { return rainAnim; }, set value(v) { rainAnim = v; } };
  const confettiId = { get value() { return confettiAnim; }, set value(v) { confettiAnim = v; } };

  runParticleLoop({
    particles,
    animId: rainId,
    cancelId: confettiId,
    beforeDraw(parts, canvasW, canvasH) {
      // Screen shake
      if (rainShakeFrames > 0) {
        rainShakeFrames--;
        const shakeX = (Math.random() - 0.5) * 12;
        const shakeY = (Math.random() - 0.5) * 12;
        canvas.style.transform = `translate(${shakeX}px,${shakeY}px)`;
      } else {
        canvas.style.transform = "";
      }

      // Dim overlay
      let maxLife = 0;
      for (const q of parts) {
        if (q.life > 0) maxLife = Math.max(maxLife, q.life);
      }
      ctx.fillStyle = `rgba(10, 10, 30, ${0.4 * Math.min(1, maxLife)})`;
      ctx.fillRect(0, 0, canvasW, canvasH);
    },
    updateParticle(p, canvasW, canvasH) {
      if (p.delay > 0) { p.delay--; return true; }
      if (p.life <= 0) return false;
      p.y += p.vy;
      if (p.y > canvasH) p.life -= 0.04;

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
      return true;
    },
    onDone() {
      canvas.style.transform = "";
    },
  });
}
