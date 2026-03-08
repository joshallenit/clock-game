// --- Clock canvas geometry ---

export const CLOCK = {
  size: 500,
  center: 250,
  radius: 230,
  tickOuterInset: 8,
  hourTickInnerInset: 25,
  minuteTickInnerInset: 12,
  numberInset: 45,
  hourHand: { lengthRatio: 0.5, width: 6 },
  minuteHand: { lengthRatio: 0.7, width: 4 },
  centerDotRadius: 6,
  borderWidth: 4,
  hourTickWidth: 3,
  minuteTickWidth: 1,
  numberFont: "bold 24px sans-serif",
} as const;

// --- Dog sprite rendering ---

export const DOG = {
  scale: 1.2,

  // Shared line widths
  tailWidth: 5,
  thinLine: 2,

  // --- Happy dog (side view) ---
  happy: {
    body: { rx: 28, ry: 18 },
    legs: {
      frontRight: { x: 12, y: 12, w: 6, h: 20 },
      frontLeft: { x: 20, y: 12, w: 6, h: 20 },
      backRight: { x: -18, y: 12, w: 6, h: 20 },
      backLeft: { x: -10, y: 12, w: 6, h: 20 },
    },
    tail: { x0: -28, y0: -6, cpX: -40, cpY: -30, x1: -32, y1: -34 },
    head: { cx: 26, cy: -14, rx: 16, ry: 14 },
    ear: { cx: 34, cy: -26, rx: 7, ry: 12, rotation: 0.3 },
    eye: { cx: 32, cy: -16, r: 3 },
    nose: { cx: 40, cy: -10, r: 3 },
    tongue: { cx: 38, cy: -3, rx: 3, ry: 6, rotation: 0.2 },
  },

  // --- Front-facing dog ---
  front: {
    body: { cy: 4, rx: 24, ry: 20 },
    chest: { cy: 8, rx: 12, ry: 10 },
    backLeg: { xOff: 14, y: 16, w: 6, h: 22, pawRx: 5, pawRy: 3, swingFactor: 0.7 },
    frontLeg: { xOff: 10, y: 16, w: 7, h: 20, pawRx: 5, pawRy: 3.5, pawXOff: 0.5 },
    head: { cy: -20, rx: 18, ry: 16 },
    ear: { xOff: 18, cy: -16, rx: 8, ry: 14, rotation: 0.3 },
    muzzle: { cy: -14, rx: 10, ry: 8 },
    eye: { xOff: 7, cy: -24, r: 3.5 },
    eyeShine: { leftX: -5.5, rightX: 8.5, cy: -25.5, r: 1.2 },
    nose: { cy: -15, rx: 4, ry: 3 },
    tongue: { cx: 3, cy: -8, rx: 4, ry: 7, rotation: 0.15 },
    legSwingAmplitude: 12,
  },

  // --- Sad dog ---
  sad: {
    body: { cy: 4, rx: 24, ry: 20 },
    paw: { xOff: 10, cy: 22, rx: 6, ry: 4 },
    tail: { x0: -20, y0: 10, cpX: -34, cpY: 18, x1: -30, y1: 26 },
    head: { cy: -22, rx: 16, ry: 14 },
    ear: { xOff: 14, cy: -18, rx: 7, ry: 14, rotation: 0.4 },
    eye: { xOff: 6, cy: -24, rx: 3, ry: 1.5 },
    eyebrow: { outerX: 10, outerY: -28, innerX: 3, innerY: -26 },
    nose: { cy: -17, r: 3 },
    mouth: { cy: -11, r: 5, arcInset: 0.3 },
    tear: { x: 10, cy: -18, rx: 2, ry: 3, alpha: 0.7 },
    seatY: 20,
    /** Head bob speed in radians per millisecond. */
    headBobSpeed: 0.006,
    headBobAmplitude: 3,
  },

  // --- Animation layout ---
  run: { offscreen: 100, groundRatio: 0.55, jumpRatio: 0.3, bounces: 3 },
  approach: { startScale: 0.3, endScale: 5, startYRatio: 0.45, endY: -200, bounces: 10, bounceScale: 0.3, legSpeed: 45 },
} as const;

// --- Game rules and difficulty ---

export const RULES = {
  winningScore: 10,
  maxMistakes: 5,
  optionCount: 6,
  hideNonQuarterNumbersAt: 4,
  hideAllNumbersAt: 6,
  randomMinutesAt: 7,
  hintPenaltyMs: 30_000,
} as const;

// --- Animation durations (ms) and effect settings ---

export const ANIM = {
  /** Duration of the clock spin transition between rounds. */
  spinDurationMs: 2000,
  /** Duration of the dog run-across animation. */
  dogRunDurationMs: 3000,
  /** Duration of the dog approach-camera animation. */
  dogApproachDurationMs: 3333,
  /** Duration of the sad dog sitting animation. */
  sadDogDurationMs: 2000,
  confettiCount: 200,
  rainCount: 200,
  rainShakeFrames: 20,
  winConfettiBursts: 5,
  loseRainWaves: 3,
  /** Delay (ms) between repeated confetti bursts on the win screen. */
  winBurstIntervalMs: 800,
  /** Delay (ms) between repeated rain waves on the lose screen. */
  loseRainIntervalMs: 1200,
  /** Stagger (seconds) between each option button's reveal animation. */
  optionRevealStaggerSec: 0.06,
} as const;
