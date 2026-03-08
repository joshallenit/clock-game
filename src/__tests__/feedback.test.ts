import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDOM } from "./test-dom";

beforeAll(() => {
  setupTestDOM();
});

describe("feedback", () => {
  beforeEach(async () => {
    const { state } = await import("../state");
    state.mistakes = 0;
  });

  it("setFeedback updates text and class", async () => {
    const { dom } = await import("../dom");
    const { setFeedback } = await import("../feedback");

    setFeedback("Correct!", "correct");
    expect(dom.feedback.textContent).toBe("Correct!");
    expect(dom.feedback.className).toBe("correct");
  });

  it("setFeedback clears with empty values", async () => {
    const { dom } = await import("../dom");
    const { setFeedback } = await import("../feedback");

    setFeedback("Correct!", "correct");
    setFeedback("", "");
    expect(dom.feedback.textContent).toBe("");
    expect(dom.feedback.className).toBe("");
  });

  it("updateMistakesDisplay shows correct heart counts", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { updateMistakesDisplay } = await import("../feedback");

    state.mistakes = 0;
    updateMistakesDisplay();
    // 5 red hearts, 0 black hearts
    expect(dom.mistakes.textContent).not.toContain("\uD83D\uDDA4");

    state.mistakes = 3;
    updateMistakesDisplay();
    const text = dom.mistakes.textContent ?? "";
    // Should contain both red and black hearts
    expect(text).toContain("\u2764\uFE0F");
    expect(text).toContain("\uD83D\uDDA4");
  });

  it("updateMistakesDisplay shows all black hearts at max mistakes", async () => {
    const { state } = await import("../state");
    const { dom } = await import("../dom");
    const { updateMistakesDisplay } = await import("../feedback");

    state.mistakes = 5;
    updateMistakesDisplay();
    expect(dom.mistakes.textContent).not.toContain("\u2764\uFE0F");
  });
});
