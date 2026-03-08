import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { setupTestDOM } from "./test-dom";

const HERE = dirname(fileURLToPath(import.meta.url));

beforeAll(() => {
  setupTestDOM();
});

describe("COLORS proxy", () => {
  it("returns live palette values", async () => {
    const { COLORS } = await import("../colors");

    // Should return a string value for all palette keys
    expect(typeof COLORS.background).toBe("string");
    expect(typeof COLORS.text).toBe("string");
    expect(typeof COLORS.accent).toBe("string");
    expect(typeof COLORS.dog).toBe("string");
  });

  it("getConfettiColors returns a non-empty array", async () => {
    const { getConfettiColors } = await import("../colors");
    const colors = getConfettiColors();
    expect(colors.length).toBeGreaterThan(0);
    expect(typeof colors[0]).toBe("string");
  });
});

describe("CSS/canvas color sync", () => {
  // Map from CSS custom property names to ColorPalette keys.
  // Only includes colors that must match between CSS :root and colors.ts.
  const cssVarToPaletteKey: Record<string, string> = {
    "--color-bg": "background",
    "--color-panel": "panel",
    "--color-text": "text",
    "--color-accent": "accent",
    "--color-correct": "correct",
    "--color-incorrect": "incorrect",
    "--color-gold": "gold",
  };

  function extractCssBlock(css: string, marker: string): string {
    const idx = css.indexOf(marker);
    if (idx === -1) return "";
    const start = css.indexOf("{", idx);
    let depth = 0;
    let end = start;
    for (let i = start; i < css.length; i++) {
      if (css[i] === "{") depth++;
      if (css[i] === "}") depth--;
      if (depth === 0) { end = i; break; }
    }
    return css.slice(start, end + 1);
  }

  function parseCssVars(block: string): Record<string, string> {
    const vars: Record<string, string> = {};
    const re = /(--[\w-]+):\s*([^;]+);/g;
    let m;
    while ((m = re.exec(block)) !== null) {
      vars[m[1]] = m[2].trim();
    }
    return vars;
  }

  it("dark palette matches :root CSS vars", async () => {
    const { DARK_PALETTE } = await import("../colors");
    const css = readFileSync(resolve(HERE, "../styles.css"), "utf-8");
    const rootBlock = extractCssBlock(css, ":root");
    const vars = parseCssVars(rootBlock);

    for (const [cssVar, paletteKey] of Object.entries(cssVarToPaletteKey)) {
      const cssValue = vars[cssVar];
      const tsValue = DARK_PALETTE[paletteKey as keyof typeof DARK_PALETTE];
      expect(cssValue, `${cssVar} should match DARK_PALETTE.${paletteKey}`).toBe(tsValue);
    }
  });

  it("light palette matches prefers-color-scheme: light CSS vars", async () => {
    const { LIGHT_PALETTE } = await import("../colors");
    const css = readFileSync(resolve(HERE, "../styles.css"), "utf-8");
    const lightBlock = extractCssBlock(css, "prefers-color-scheme: light");
    const vars = parseCssVars(lightBlock);

    for (const [cssVar, paletteKey] of Object.entries(cssVarToPaletteKey)) {
      const cssValue = vars[cssVar];
      const tsValue = LIGHT_PALETTE[paletteKey as keyof typeof LIGHT_PALETTE];
      expect(cssValue, `${cssVar} should match LIGHT_PALETTE.${paletteKey}`).toBe(tsValue);
    }
  });
});
