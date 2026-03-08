import { CLOCK, RULES, COLORS, dom, state } from "./config";
import { getContext2D } from "./utils";

const ctx = getContext2D(dom.clock);

export function drawHand(angle: number, length: number, width: number, color: string): void {
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
    if (state.score >= RULES.hideAllNumbersAt) break;
    if (state.score >= RULES.hideNonQuarterNumbersAt && i % 3 !== 0) continue;
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    ctx.fillText(
      String(i),
      CLOCK.center + numRadius * Math.cos(angle),
      CLOCK.center + numRadius * Math.sin(angle),
    );
  }
}

export function drawCenterDot(): void {
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
}
