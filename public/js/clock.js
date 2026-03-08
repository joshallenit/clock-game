import {
  CLOCK_SIZE, CLOCK_CENTER, CLOCK_RADIUS,
  TICK_OUTER_INSET, HOUR_TICK_INNER_INSET, MINUTE_TICK_INNER_INSET,
  NUMBER_INSET, HOUR_HAND_LENGTH_RATIO, MINUTE_HAND_LENGTH_RATIO,
  HOUR_HAND_WIDTH, MINUTE_HAND_WIDTH, CENTER_DOT_RADIUS,
  HIDE_NON_QUARTER_NUMBERS_AT, HIDE_ALL_NUMBERS_AT,
  COLORS, dom, state,
} from "./config.js";

const ctx = dom.clock.getContext("2d");

// Draw a single clock hand from center at the given angle
export function drawHand(angle, length, width, color) {
  ctx.beginPath();
  ctx.moveTo(CLOCK_CENTER, CLOCK_CENTER);
  ctx.lineTo(
    CLOCK_CENTER + length * Math.cos(angle),
    CLOCK_CENTER + length * Math.sin(angle),
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.stroke();
}

// Draw the clock face without hands (used during animations)
export function drawClockFace() {
  ctx.clearRect(0, 0, CLOCK_SIZE, CLOCK_SIZE);

  // Outer circle
  ctx.beginPath();
  ctx.arc(CLOCK_CENTER, CLOCK_CENTER, CLOCK_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Hour tick marks
  const hourInner = CLOCK_RADIUS - HOUR_TICK_INNER_INSET;
  const tickOuter = CLOCK_RADIUS - TICK_OUTER_INSET;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(CLOCK_CENTER + hourInner * Math.cos(angle), CLOCK_CENTER + hourInner * Math.sin(angle));
    ctx.lineTo(CLOCK_CENTER + tickOuter * Math.cos(angle), CLOCK_CENTER + tickOuter * Math.sin(angle));
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Minute tick marks
  const minuteInner = CLOCK_RADIUS - MINUTE_TICK_INNER_INSET;
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const angle = (i * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(CLOCK_CENTER + minuteInner * Math.cos(angle), CLOCK_CENTER + minuteInner * Math.sin(angle));
    ctx.lineTo(CLOCK_CENTER + tickOuter * Math.cos(angle), CLOCK_CENTER + tickOuter * Math.sin(angle));
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Hour numbers (hidden at higher difficulty)
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const numRadius = CLOCK_RADIUS - NUMBER_INSET;
  for (let i = 1; i <= 12; i++) {
    if (state.score >= HIDE_ALL_NUMBERS_AT) break;
    if (state.score >= HIDE_NON_QUARTER_NUMBERS_AT && i % 3 !== 0) continue;
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    ctx.fillText(i, CLOCK_CENTER + numRadius * Math.cos(angle), CLOCK_CENTER + numRadius * Math.sin(angle));
  }
}

// Draw center dot
export function drawCenterDot() {
  ctx.beginPath();
  ctx.arc(CLOCK_CENTER, CLOCK_CENTER, CENTER_DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.accent;
  ctx.fill();
}

// Draw the full clock with hands at the given hour and minute
export function drawClockAt(h, m) {
  drawClockFace();
  const hourAngle = ((h % 12 + m / 60) * Math.PI) / 6 - Math.PI / 2;
  drawHand(hourAngle, CLOCK_RADIUS * HOUR_HAND_LENGTH_RATIO, HOUR_HAND_WIDTH, COLORS.text);
  const minuteAngle = (m * Math.PI) / 30 - Math.PI / 2;
  drawHand(minuteAngle, CLOCK_RADIUS * MINUTE_HAND_LENGTH_RATIO, MINUTE_HAND_WIDTH, COLORS.accent);
  drawCenterDot();
}
