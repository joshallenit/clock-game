// Confetti burst + rain particles on shared overlay canvas (#confetti-canvas).
import { ANIM } from "./constants";
import { getConfettiColors, COLORS } from "./colors";
import { dom } from "./dom";
import { setupHiDPICanvas, prefersReducedMotion, randomChoice } from "./utils";
import type { ConfettiParticle, RainParticle, TimeoutId } from "./types";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

interface FxState {
  activeAnim: number | null;
  rainShakeFrames: number;
  resizeTimer: TimeoutId;
  logicalWidth: number;
  logicalHeight: number;
}

// Module-private rendering state (not in state.ts because it's purely visual/internal)
const fxState: FxState = {
  activeAnim: null,
  rainShakeFrames: 0,
  resizeTimer: null,
  logicalWidth: 0,
  logicalHeight: 0,
};

function resizeCanvas(): void {
  fxState.logicalWidth = window.innerWidth;
  fxState.logicalHeight = window.innerHeight;
  ctx = setupHiDPICanvas(canvas, fxState.logicalWidth, fxState.logicalHeight);
}

/** Set up the effects overlay canvas. Must be called after initDom(). */
export function initEffects(): void {
  canvas = dom.confettiCanvas;
  fxState.logicalWidth = window.innerWidth;
  fxState.logicalHeight = window.innerHeight;
  ctx = setupHiDPICanvas(canvas, fxState.logicalWidth, fxState.logicalHeight);

  window.addEventListener("resize", () => {
    if (fxState.resizeTimer !== null) clearTimeout(fxState.resizeTimer);
    fxState.resizeTimer = setTimeout(resizeCanvas, 100);
  });
}

// --- Shared particle animation loop ---
// dt is normalized so 1.0 = one frame at 60 fps (16.67 ms).
// Multiplying per-frame values by dt keeps physics consistent across refresh rates.

const FRAME_MS_60HZ = 1000 / 60;

function runParticleLoop<P>(config: {
  particles: P[];
  beforeDraw?: (particles: P[], dt: number, width: number, height: number) => void;
  updateParticle: (particle: P, dt: number, width: number, height: number) => boolean;
  drawParticle: (ctx: CanvasRenderingContext2D, particle: P) => void;
  onDone?: () => void;
}): boolean {
  if (prefersReducedMotion()) return false;
  if (fxState.activeAnim !== null) cancelAnimationFrame(fxState.activeAnim);

  let lastTime = performance.now();

  function step(now: number): void {
    const dt = (now - lastTime) / FRAME_MS_60HZ;
    lastTime = now;

    const cw = fxState.logicalWidth;
    const ch = fxState.logicalHeight;
    ctx.clearRect(0, 0, cw, ch);

    config.beforeDraw?.(config.particles, dt, cw, ch);

    let alive = false;
    for (const p of config.particles) {
      if (config.updateParticle(p, dt, cw, ch)) {
        alive = true;
        config.drawParticle(ctx, p);
      }
    }

    if (alive) {
      fxState.activeAnim = requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, cw, ch);
      fxState.activeAnim = null;
      config.onDone?.();
    }
  }

  fxState.activeAnim = requestAnimationFrame(step);
  return true;
}

// --- Confetti burst from screen center ---

export function launchConfetti(): void {
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
      color: randomChoice(getConfettiColors()),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      life: 1,
    });
  }

  runParticleLoop({
    particles,
    updateParticle(p, dt) {
      if (p.life <= 0) return false;
      p.x += p.vx * dt;
      p.vy += 0.25 * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;
      p.life -= 0.008 * dt;
      return true;
    },
    drawParticle(c, p) {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.globalAlpha = Math.max(0, p.life);
      c.fillStyle = p.color;
      c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      c.restore();
    },
  });
}

// --- Sad rain with screen shake ---

export function launchRain(): void {
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
    beforeDraw(parts, dt, canvasW, canvasH) {
      // Screen shake
      if (fxState.rainShakeFrames > 0) {
        fxState.rainShakeFrames -= dt;
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
    updateParticle(p, dt, _canvasW, canvasH) {
      if (p.delay > 0) {
        p.delay -= dt;
        return true;
      }
      if (p.life <= 0) return false;
      p.y += p.vy * dt;
      if (p.y > canvasH) p.life -= 0.04 * dt;
      return true;
    },
    drawParticle(c, p) {
      if (p.delay > 0) return;
      c.save();
      c.globalAlpha = Math.max(0, p.life) * 0.8;
      c.strokeStyle = COLORS.rain;
      c.lineWidth = 3;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x + 2, p.y + p.length);
      c.stroke();
      c.restore();
    },
    onDone() {
      canvas.style.transform = "";
    },
  });
}
