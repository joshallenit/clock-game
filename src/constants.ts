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

// --- Animation frame counts and effect settings ---

export const ANIM = {
  spinFrames: 120,
  dogRunFrames: 180,
  dogApproachFrames: 200,
  sadDogFrames: 120,
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

