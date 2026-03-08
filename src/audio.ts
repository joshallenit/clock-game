// Note frequencies (Hz) used by sound effects
const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
  Eb4: 311.13, F4: 349.23,
  C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.51,
  D3: 146.83, G3: 196.0, A3: 220.0,
  SUB_BASS: 40, LOW_BASS: 60,
} as const;

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      // AudioContext unavailable — all sound functions become no-ops
    }
  }
  if (audioCtx?.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Warm up the AudioContext from a user gesture so iOS Safari allows playback. */
export function ensureAudioContext(): void {
  getAudioContext();
}

function playTone(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  volume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}

// Ascending arpeggio: C5 → E5 → G5 → C6 → E6
const CORRECT_NOTES = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6];

export function playCorrectSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  CORRECT_NOTES.forEach((freq, i) => {
    playTone(ctx, freq, "triangle", now + i * 0.1, 0.6, 0.5);
    playTone(ctx, freq, "square", now + i * 0.1, 0.6, 0.15);
  });
}

// Descending: G4 → F4 → Eb4 → C4 (with detuned doubles for dissonance)
const INCORRECT_NOTES = [NOTE.G4, NOTE.F4, NOTE.Eb4, NOTE.C4];
const DETUNE_RATIO = 0.998;

export function playIncorrectSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  INCORRECT_NOTES.forEach((freq, i) => {
    playTone(ctx, freq, "sawtooth", now + i * 0.25, 0.8, 0.5);
    playTone(ctx, freq * DETUNE_RATIO, "sawtooth", now + i * 0.25, 0.8, 0.5);
  });
  playTone(ctx, NOTE.LOW_BASS, "sine", now, 1.5, 0.6);
}

export function playWhineSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Primary descending whine
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.6);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.9);
  osc.frequency.exponentialRampToValueAtTime(300, now + 1.5);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.setValueAtTime(0.3, now + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.7);
  gain.gain.setValueAtTime(0.25, now + 0.9);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.5);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };

  // Second whimper
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(700, now + 0.5);
  osc2.frequency.exponentialRampToValueAtTime(350, now + 1.0);
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.setValueAtTime(0.2, now + 0.5);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 1.0);
  osc2.onended = () => { osc2.disconnect(); gain2.disconnect(); };
}

// Descending doom: D4 → C4 → A3 → G3 → D3 (with detuned doubles)
const GAME_OVER_NOTES = [NOTE.D4, NOTE.C4, NOTE.A3, NOTE.G3, NOTE.D3];
const GAME_OVER_DETUNE = 0.997;

export function playGameOverSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  GAME_OVER_NOTES.forEach((freq, i) => {
    playTone(ctx, freq, "sawtooth", now + i * 0.35, 1.2, 0.4);
    playTone(ctx, freq * GAME_OVER_DETUNE, "sawtooth", now + i * 0.35, 1.2, 0.4);
  });
  playTone(ctx, NOTE.SUB_BASS, "sine", now, 2.5, 0.7);
}
