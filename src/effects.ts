// Confetti burst + rain particles on shared overlay canvas (#confetti-canvas).
import { ANIM } from "./constants";
import { CONFETTI_COLORS, COLORS } from "./colors";
import { dom } from "./dom";
import { setupHiDPICanvas, prefersReducedMotion, randomChoice } from "./utils";
import type { ConfettiParticle, RainParticle, TimeoutId } from "./types";

const canvas = dom.confettiCanvas;
let ctx = setupHiDPICanvas(canvas, window.innerWidth, window.innerHeight);

// Module-private rendering state (not in state.ts because it's purely visual/internal)
const fxState = {
  activeAnim: null as number | null,
  rainShakeFrames: 0,
  resizeTimer: null as TimeoutId,
  logicalWidth: window.innerWidth,
  logicalHeight: window.innerHeight,
};

function resizeCanvas(): void {
  fxState.logicalWidth = window.innerWidth;
  fxState.logicalHeight = window.innerHeight;
  ctx = setupHiDPICanvas(canvas, fxState.logicalWidth, fxState.logicalHeight);
}

window.addEventListener("resize", () => {
  if (fxState.resizeTimer !== null) clearTimeout(fxState.resizeTimer);
  fxState.resizeTimer = setTimeout(resizeCanvas, 100);
});

// --- Shared particle animation loop ---

function runParticleLoop<P>(config: {
  particles: P[];
  beforeDraw?: (particles: P[], width: number, height: number) => void;
  updateParticle: (particle: P, width: number, height: number) => boolean;
  onDone?: () => void;
}): void {
  if (fxState.activeAnim !== null) cancelAnimationFrame(fxState.activeAnim);

  function step(): void {
    const cw = fxState.logicalWidth;
    const ch = fxState.logicalHeight;
    ctx.clearRect(0, 0, cw, ch);

    config.beforeDraw?.(config.particles, cw, ch);

    let alive = false;
    for (const p of config.particles) {
      if (config.updateParticle(p, cw, ch)) alive = true;
    }

    if (alive) {
      fxState.activeAnim = requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, cw, ch);
      fxState.activeAnim = null;
      config.onDone?.();
    }
  }

  step();
}

// --- Confetti burst from screen center ---

export function launchConfetti(): void {
  if (prefersReducedMotion()) return;

  const cx = fxState.logicalWidth / 2;
  const cy = fxState.logicalHeight / 2;

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
      color: randomChoice(CONFETTI_COLORS),
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
      ctx.restore();
      return true;
    },
  });
}

// --- Sad rain with screen shake ---

export function launchRain(): void {
  if (prefersReducedMotion()) return;

  resizeCanvas();

  const cw = fxState.logicalWidth;
  const ch = fxState.logicalHeight;

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

  fxState.rainShakeFrames = ANIM.rainShakeFrames;

  runParticleLoop({
    particles,
    beforeDraw(parts, canvasW, canvasH) {
      // Screen shake
      if (fxState.rainShakeFrames > 0) {
        fxState.rainShakeFrames--;
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
      ctx.fillStyle = `rgba(${COLORS.rainOverlay}, ${0.4 * Math.min(1, maxLife)})`;
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
