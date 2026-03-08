import { CONFETTI_COLORS, COLORS, ANIM, dom } from "./config";
import type { ConfettiParticle, RainParticle } from "./types";

const canvas = dom.confettiCanvas;
const ctx = canvas.getContext("2d")!;

let activeAnim: number | null = null;
let rainShakeFrames = 0;

function resizeCanvas(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// --- Shared particle animation loop ---

function runParticleLoop<P>(config: {
  particles: P[];
  beforeDraw?: (particles: P[], width: number, height: number) => void;
  updateParticle: (particle: P, width: number, height: number) => boolean;
  onDone?: () => void;
}): void {
  if (activeAnim !== null) cancelAnimationFrame(activeAnim);

  function step(): void {
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    config.beforeDraw?.(config.particles, cw, ch);

    let alive = false;
    for (const p of config.particles) {
      if (config.updateParticle(p, cw, ch)) alive = true;
    }

    if (alive) {
      activeAnim = requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, cw, ch);
      activeAnim = null;
      config.onDone?.();
    }
  }

  step();
}

// --- Confetti burst from screen center ---

export function launchConfetti(): void {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < ANIM.confettiCount; i++) {
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

  runParticleLoop({
    particles,
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

export function launchRain(): void {
  resizeCanvas();

  const cw = canvas.width;
  const ch = canvas.height;

  const particles: RainParticle[] = [];
  for (let i = 0; i < ANIM.rainCount; i++) {
    particles.push({
      x: Math.random() * cw,
      y: Math.random() * -ch,
      vy: Math.random() * 6 + 8,
      length: Math.random() * 30 + 20,
      delay: Math.random() * 40,
      life: 1,
    });
  }

  rainShakeFrames = ANIM.rainShakeFrames;

  runParticleLoop({
    particles,
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
    updateParticle(p, _canvasW, canvasH) {
      if (p.delay > 0) {
        p.delay--;
        return true;
      }
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
