// Clock canvas: draw face/hands/numbers, animated spin transition between rounds.
import { CLOCK, ANIM } from "./constants";
import { COLORS } from "./colors";
import { dom } from "./dom";
import { state } from "./state";
import { getContext2D, formatTime } from "./utils";
import { shouldShowHourNumber } from "./difficulty";

const ctx = getContext2D(dom.clock);

// HiDPI canvas support -- scale backing store for crisp rendering on Retina displays
const dpr = window.devicePixelRatio || 1;
dom.clock.width = CLOCK.size * dpr;
dom.clock.height = CLOCK.size * dpr;
ctx.scale(dpr, dpr);

function updateClockAriaLabel(h: number, m: number): void {
  dom.clock.setAttribute("aria-label", `Analog clock showing ${formatTime(h, m)}`);
}

function drawHand(angle: number, length: number, width: number, color: string): void {
  ctx.beginPath();
  ctx.moveTo(CLOCK.center, CLOCK.center);
  ctx.lineTo(CLOCK.center + length * Math.cos(angle), CLOCK.center + length * Math.sin(angle));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.stroke();
}

export function drawClockFace(): void {
  ctx.clearRect(0, 0, CLOCK.size, CLOCK.size);

  // Outer circle
  ctx.beginPath();
  ctx.arc(CLOCK.center, CLOCK.center, CLOCK.radius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Hour tick marks
  const hourInner = CLOCK.radius - CLOCK.hourTickInnerInset;
  const tickOuter = CLOCK.radius - CLOCK.tickOuterInset;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(
      CLOCK.center + hourInner * Math.cos(angle),
      CLOCK.center + hourInner * Math.sin(angle),
    );
    ctx.lineTo(
      CLOCK.center + tickOuter * Math.cos(angle),
      CLOCK.center + tickOuter * Math.sin(angle),
    );
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Minute tick marks
  const minuteInner = CLOCK.radius - CLOCK.minuteTickInnerInset;
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const angle = (i * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(
      CLOCK.center + minuteInner * Math.cos(angle),
      CLOCK.center + minuteInner * Math.sin(angle),
    );
    ctx.lineTo(
      CLOCK.center + tickOuter * Math.cos(angle),
      CLOCK.center + tickOuter * Math.sin(angle),
    );
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Hour numbers (hidden progressively at higher difficulty)
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const numRadius = CLOCK.radius - CLOCK.numberInset;
  for (let i = 1; i <= 12; i++) {
    if (!shouldShowHourNumber(state.score, i)) continue;
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    ctx.fillText(
      String(i),
      CLOCK.center + numRadius * Math.cos(angle),
      CLOCK.center + numRadius * Math.sin(angle),
    );
  }
}

function drawCenterDot(): void {
  ctx.beginPath();
  ctx.arc(CLOCK.center, CLOCK.center, CLOCK.centerDotRadius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.accent;
  ctx.fill();
}

export function drawClockAt(h: number, m: number): void {
  drawClockFace();
  const hourAngle = (((h % 12) + m / 60) * Math.PI) / 6 - Math.PI / 2;
  drawHand(hourAngle, CLOCK.radius * CLOCK.hourHand.lengthRatio, CLOCK.hourHand.width, COLORS.text);
  const minuteAngle = (m * Math.PI) / 30 - Math.PI / 2;
  drawHand(
    minuteAngle,
    CLOCK.radius * CLOCK.minuteHand.lengthRatio,
    CLOCK.minuteHand.width,
    COLORS.accent,
  );
  drawCenterDot();
  updateClockAriaLabel(h, m);
}

/** Spin clock hands from random angles to the target time, then call onComplete. */
export function animateToTime(h: number, m: number, onComplete: () => void): void {
  if (state.spinAnimId !== null) cancelAnimationFrame(state.spinAnimId);
  let frame = 0;

  const startMinAngle = Math.random() * Math.PI * 2;
  const startHourAngle = Math.random() * Math.PI * 2;
  const targetMinAngle = (m * Math.PI) / 30 - Math.PI / 2;
  const targetHourAngle = (((h % 12) + m / 60) * Math.PI) / 6 - Math.PI / 2;

  let endMinAngle = targetMinAngle + Math.PI * 8;
  while (endMinAngle < startMinAngle) endMinAngle += Math.PI * 2;
  let endHourAngle = targetHourAngle + Math.PI * 4;
  while (endHourAngle < startHourAngle) endHourAngle += Math.PI * 2;

  function animate(): void {
    frame++;
    const t = frame / ANIM.spinFrames;
    const ease = 1 - Math.pow(1 - t, 5);

    const currentMin = startMinAngle + (endMinAngle - startMinAngle) * ease;
    const currentHour = startHourAngle + (endHourAngle - startHourAngle) * ease;

    drawClockFace();
    drawHand(currentHour, CLOCK.radius * CLOCK.hourHand.lengthRatio, CLOCK.hourHand.width, COLORS.text);
    drawHand(currentMin, CLOCK.radius * CLOCK.minuteHand.lengthRatio, CLOCK.minuteHand.width, COLORS.accent);
    drawCenterDot();

    if (frame < ANIM.spinFrames) {
      state.spinAnimId = requestAnimationFrame(animate);
    } else {
      state.spinAnimId = null;
      updateClockAriaLabel(h, m);
      onComplete();
    }
  }

  animate();
}
