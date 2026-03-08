// NOTE: These values are duplicated in styles.css as CSS custom properties.
// Canvas rendering cannot use CSS variables, so keep both in sync when changing colors.

interface ColorPalette {
  background: string;
  panel: string;
  text: string;
  accent: string;
  muted: string;
  correct: string;
  incorrect: string;
  gold: string;
  dog: string;
  dogDark: string;
  dogChest: string;
  dogTongue: string;
  dogEye: string;
  dogNose: string;
  rain: string;
}

const DARK_PALETTE: ColorPalette = {
  background: "#1a1a2e",
  panel: "#16213e",
  text: "#e2e2e2",
  accent: "#a2d2ff",
  muted: "#555",
  correct: "#4ade80",
  incorrect: "#e63946",
  gold: "#facc15",
  dog: "#c4813d",
  dogDark: "#9a6530",
  dogChest: "#d4975a",
  dogTongue: "#e63946",
  dogEye: "#222",
  dogNose: "#333",
  rain: "#6899cc",
};

const LIGHT_PALETTE: ColorPalette = {
  background: "#f5f7fa",
  panel: "#ffffff",
  text: "#1e293b",
  accent: "#2563eb",
  muted: "#94a3b8",
  correct: "#16a34a",
  incorrect: "#dc2626",
  gold: "#d97706",
  dog: "#c4813d",
  dogDark: "#9a6530",
  dogChest: "#d4975a",
  dogTongue: "#dc2626",
  dogEye: "#222",
  dogNose: "#333",
  rain: "#3b82f6",
};

const DARK_CONFETTI = [
  "#4ade80", "#a2d2ff", "#f59e0b", "#e63946", "#c084fc",
  "#fb923c", "#22d3ee", "#facc15", "#f472b6",
];

const LIGHT_CONFETTI = [
  "#16a34a", "#2563eb", "#d97706", "#dc2626", "#9333ea",
  "#ea580c", "#0891b2", "#ca8a04", "#db2777",
];

export const COLORS: ColorPalette = { ...DARK_PALETTE };
export const CONFETTI_COLORS: string[] = [...DARK_CONFETTI];

/** Callbacks invoked when the color scheme changes (e.g. to redraw the clock). */
const schemeChangeListeners: Array<() => void> = [];

export function onColorSchemeChange(cb: () => void): void {
  schemeChangeListeners.push(cb);
}

function applyColorScheme(): void {
  const prefersLight =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches;
  const palette = prefersLight ? LIGHT_PALETTE : DARK_PALETTE;
  const confetti = prefersLight ? LIGHT_CONFETTI : DARK_CONFETTI;

  Object.assign(COLORS, palette);
  CONFETTI_COLORS.length = 0;
  CONFETTI_COLORS.push(...confetti);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", COLORS.background);

  for (const cb of schemeChangeListeners) cb();
}

applyColorScheme();
if (typeof window.matchMedia === "function") {
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", applyColorScheme);
}
