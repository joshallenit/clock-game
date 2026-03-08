let audioCtx: AudioContext | null = null;

try {
  audioCtx = new AudioContext();
} catch {
  // AudioContext unavailable — all sound functions become no-ops
}

function resumeAudio(): void {
  if (audioCtx?.state === "suspended") audioCtx.resume();
}

document.addEventListener("click", resumeAudio);
document.addEventListener("keydown", resumeAudio);

function playTone(
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  volume: number,
): void {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playCorrectSound(): void {
  if (!audioCtx) return;
  resumeAudio();
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  const now = audioCtx.currentTime;
  notes.forEach((freq, i) => {
    playTone(freq, "triangle", now + i * 0.1, 0.6, 0.5);
    playTone(freq, "square", now + i * 0.1, 0.6, 0.15);
  });
}

export function playIncorrectSound(): void {
  if (!audioCtx) return;
  resumeAudio();
  const notes = [392.0, 349.23, 311.13, 261.63];
  const now = audioCtx.currentTime;
  notes.forEach((freq, i) => {
    playTone(freq, "sawtooth", now + i * 0.25, 0.8, 0.5);
    playTone(freq * 0.998, "sawtooth", now + i * 0.25, 0.8, 0.5);
  });
  playTone(60, "sine", now, 1.5, 0.6);
}

export function playWhineSound(): void {
  if (!audioCtx) return;
  resumeAudio();
  const now = audioCtx.currentTime;

  // Primary descending whine
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
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
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.5);

  // Second whimper
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(700, now + 0.5);
  osc2.frequency.exponentialRampToValueAtTime(350, now + 1.0);
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.setValueAtTime(0.2, now + 0.5);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);
  osc2.start(now);
  osc2.stop(now + 1.0);
}

export function playGameOverSound(): void {
  if (!audioCtx) return;
  resumeAudio();
  const notes = [293.66, 261.63, 220.0, 196.0, 146.83];
  const now = audioCtx.currentTime;
  notes.forEach((freq, i) => {
    playTone(freq, "sawtooth", now + i * 0.35, 1.2, 0.4);
    playTone(freq * 0.997, "sawtooth", now + i * 0.35, 1.2, 0.4);
  });
  playTone(40, "sine", now, 2.5, 0.7);
}
